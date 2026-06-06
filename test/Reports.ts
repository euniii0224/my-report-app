import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers.js'
import { expect } from 'chai'
import hre from 'hardhat'
const { ethers } = hre

describe('Report', function () {
  async function deployReportFixture() {
    const [admin, user1, user2] = await ethers.getSigners()
    const Report = await ethers.getContractFactory('Report')
    const report = await Report.deploy()
    return { report, admin, user1, user2 }
  }

  // ─────────────────────────────────────────
  // 배포 테스트
  // ─────────────────────────────────────────
  describe('Deployment', function () {
    it('배포자가 admin으로 설정되어야 함', async function () {
      const { report, admin } = await loadFixture(deployReportFixture)
      expect(await report.admin()).to.equal(admin.address)
    })

    it('초기 신고 수는 0이어야 함', async function () {
      const { report } = await loadFixture(deployReportFixture)
      expect(await report.getReportCount()).to.equal(0)
    })
  })

  // ─────────────────────────────────────────
  // 제보 등록 테스트
  // ─────────────────────────────────────────
  describe('submitReport', function () {
    it('제보 등록 후 신고 수가 1 증가해야 함', async function () {
      const { report, user1 } = await loadFixture(deployReportFixture)
      await report.connect(user1).submitReport('QmHash123', '폭력')
      expect(await report.getReportCount()).to.equal(1)
    })

    it('제보 등록 시 ReportSubmitted 이벤트가 발생해야 함', async function () {
      const { report, user1 } = await loadFixture(deployReportFixture)
      await expect(
        report.connect(user1).submitReport('QmHash123', '부패'),
      ).to.emit(report, 'ReportSubmitted')
    })

    it('IPFS 해시 없이 등록하면 실패해야 함', async function () {
      const { report, user1 } = await loadFixture(deployReportFixture)
      await expect(
        report.connect(user1).submitReport('', '폭력'),
      ).to.be.revertedWith('IPFS hash is required')
    })

    it('카테고리 없이 등록하면 실패해야 함', async function () {
      const { report, user1 } = await loadFixture(deployReportFixture)
      await expect(
        report.connect(user1).submitReport('QmHash123', ''),
      ).to.be.revertedWith('Category is required')
    })
  })

  // ─────────────────────────────────────────
  // 조회 코드로 제보 확인 테스트
  // ─────────────────────────────────────────
  describe('getReportByCode', function () {
    it('조회 코드로 제보 상태를 확인할 수 있어야 함', async function () {
      const { report, user1 } = await loadFixture(deployReportFixture)
      const tx = await report.connect(user1).submitReport('QmHash123', '환경')
      const receipt = await tx.wait()

      // 이벤트에서 trackingCode 추출
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === 'ReportSubmitted',
      ) as any
      const trackingCode = event?.args[1]

      const [id, category, status] = await report.getReportByCode(trackingCode)
      expect(id).to.equal(1)
      expect(category).to.equal('환경')
      expect(status).to.equal(0) // Submitted
    })

    it('잘못된 조회 코드는 실패해야 함', async function () {
      const { report } = await loadFixture(deployReportFixture)
      const fakeCode = ethers.keccak256(ethers.toUtf8Bytes('fake'))
      await expect(report.getReportByCode(fakeCode)).to.be.revertedWith(
        'Invalid tracking code',
      )
    })
  })

  // ─────────────────────────────────────────
  // 상태 변경 테스트
  // ─────────────────────────────────────────
  describe('updateStatus', function () {
    it('관리자가 상태를 변경할 수 있어야 함', async function () {
      const { report, admin, user1 } = await loadFixture(deployReportFixture)
      const tx = await report.connect(user1).submitReport('QmHash123', '폭력')
      const receipt = await tx.wait()

      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === 'ReportSubmitted',
      ) as any
      const trackingCode = event?.args[1]

      await report.connect(admin).updateStatus(1, 1) // UnderReview
      const [, , status] = await report.getReportByCode(trackingCode)
      expect(status).to.equal(1) // UnderReview
    })

    it('일반 사용자가 상태 변경 시 실패해야 함', async function () {
      const { report, user1 } = await loadFixture(deployReportFixture)
      await report.connect(user1).submitReport('QmHash123', '폭력')
      await expect(report.connect(user1).updateStatus(1, 1)).to.be.revertedWith(
        'Only admin can call this',
      )
    })

    it('최종 상태(Resolved)는 변경 불가해야 함', async function () {
      const { report, admin, user1 } = await loadFixture(deployReportFixture)
      await report.connect(user1).submitReport('QmHash123', '폭력')
      await report.connect(admin).updateStatus(1, 2) // Resolved
      await expect(report.connect(admin).updateStatus(1, 1)).to.be.revertedWith(
        'Cannot change final status',
      )
    })
  })

  // ─────────────────────────────────────────
  // 관리자 전체 목록 테스트
  // ─────────────────────────────────────────
  describe('getAllReports', function () {
    it('관리자는 전체 제보 목록을 볼 수 있어야 함', async function () {
      const { report, admin, user1 } = await loadFixture(deployReportFixture)
      await report.connect(user1).submitReport('QmHash1', '폭력')
      await report.connect(user1).submitReport('QmHash2', '부패')
      const all = await report.connect(admin).getAllReports()
      expect(all.length).to.equal(2)
    })

    it('일반 사용자는 전체 목록 조회 시 실패해야 함', async function () {
      const { report, user1 } = await loadFixture(deployReportFixture)
      await expect(report.connect(user1).getAllReports()).to.be.revertedWith(
        'Only admin can call this',
      )
    })
  })

  // ─────────────────────────────────────────
  // 공개 제보 목록 테스트
  // ─────────────────────────────────────────
  describe('getPublicReports', function () {
    it('Resolved 상태 제보만 공개 목록에 나와야 함', async function () {
      const { report, admin, user1 } = await loadFixture(deployReportFixture)
      await report.connect(user1).submitReport('QmHash1', '폭력')
      await report.connect(user1).submitReport('QmHash2', '부패')
      await report.connect(admin).updateStatus(1, 2) // Resolved
      // 2번은 Submitted 상태 유지

      const publicList = await report.getPublicReports()
      expect(publicList.length).to.equal(1)
      expect(publicList[0].category).to.equal('폭력')
      expect(publicList[0].ipfsHash).to.equal('') // ipfsHash 숨겨져야 함
    })
  })
})
