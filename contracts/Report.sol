// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Report {

    // ───────────────────────────────────────────
    // 상태값 enum
    // ───────────────────────────────────────────
    enum ReportStatus {
        Submitted,   // 0: 제출됨
        UnderReview, // 1: 검토중
        Resolved,    // 2: 처리완료
        Rejected     // 3: 반려
    }

    // ───────────────────────────────────────────
    // 제보 데이터 구조체
    // ───────────────────────────────────────────
    struct ReportData {
        uint256 id;   //신고 번호
        address reporter;  //신고자 지갑 주소
        string ipfsHash;  //IPFS 저장 위치
        string category;  //신고 종류 (폭력, 부패, 환경 등)
        ReportStatus status; //현재 상태 저장
        uint256 timestamp;  //신고 시각
        bytes32 trackingCode;  //조회코드 (사용자가 자기 신고 확인할 때 사용)
    }

    // ───────────────────────────────────────────
    // 상태 변수
    // ───────────────────────────────────────────
    address public admin;   //관리자 주소
    uint256 private reportCount;  //신고 개수

    mapping(uint256 => ReportData) private reports;       // id → 제보
    mapping(bytes32 => uint256)   private trackingToId;  // 조회코드 → id

    // ───────────────────────────────────────────
    // 이벤트
    // ───────────────────────────────────────────
    event ReportSubmitted(uint256 indexed id, bytes32 trackingCode, address reporter);
    //블록체인 로그 기록 (신고 등록됨. 같은 알림을 프론트에서 감지 가능)
    event StatusUpdated(uint256 indexed id, ReportStatus newStatus);

    // ───────────────────────────────────────────
    // 접근 제한자
    // ───────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    } //관리자만 실행 가능하게 제한

    modifier reportExists(uint256 _id) {
        require(_id > 0 && _id <= reportCount, "Report does not exist");
        _;
    } //없는 신고번호 접근 막음

    // ───────────────────────────────────────────
    // 생성자 - 배포자가 관리자
    // ───────────────────────────────────────────
    constructor() {
        admin = msg.sender;
    }

    // ───────────────────────────────────────────
    // 함수 1: 제보 등록 (신고자 호출)
    // ───────────────────────────────────────────
    function submitReport(
        string memory _ipfsHash,
        string memory _category
    ) public returns (bytes32) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
        require(bytes(_category).length > 0, "Category is required");

        reportCount++;
        uint256 newId = reportCount;

        // 조회 코드 생성: 지갑주소 + id + 시각을 해시
        bytes32 trackingCode = keccak256(
            abi.encodePacked(msg.sender, newId, block.timestamp)
        );

        reports[newId] = ReportData({
            id:           newId,
            reporter:     msg.sender,
            ipfsHash:     _ipfsHash,
            category:     _category,
            status:       ReportStatus.Submitted,
            timestamp:    block.timestamp,
            trackingCode: trackingCode
        });

        trackingToId[trackingCode] = newId;

        emit ReportSubmitted(newId, trackingCode, msg.sender);

        return trackingCode;
    }

    // ───────────────────────────────────────────
    // 함수 2: 상태 변경 (관리자만 호출)
    // ───────────────────────────────────────────
    function updateStatus(
        uint256 _id,
        ReportStatus _newStatus
    ) public onlyAdmin reportExists(_id) {
        ReportStatus current = reports[_id].status;

        // Resolved 또는 Rejected는 최종 상태 → 변경 불가
        require(
            current != ReportStatus.Resolved && current != ReportStatus.Rejected,
            "Cannot change final status"
        );

        reports[_id].status = _newStatus;

        emit StatusUpdated(_id, _newStatus);
    }

    // ───────────────────────────────────────────
    // 함수 3: 조회 코드로 내 제보 현황 확인 (신고자 호출)
    // ───────────────────────────────────────────
    function getReportByCode(
        bytes32 _trackingCode
    ) public view returns (
        uint256 id,
        string memory category,
        ReportStatus status,
        uint256 timestamp
    ) {
        uint256 rid = trackingToId[_trackingCode];
        require(rid != 0, "Invalid tracking code");

        ReportData storage r = reports[rid];

        // ipfsHash는 노출하지 않음 (암호화 키 없이는 어차피 못 읽지만 방어적으로)
        return (r.id, r.category, r.status, r.timestamp);
    }

    // ───────────────────────────────────────────
    // 함수 4: 전체 제보 목록 (관리자만)
    // ───────────────────────────────────────────
    function getAllReports() public view onlyAdmin returns (ReportData[] memory) {
        ReportData[] memory result = new ReportData[](reportCount);
        for (uint256 i = 1; i <= reportCount; i++) {
            result[i - 1] = reports[i];
        }
        return result;
    }

    // ───────────────────────────────────────────
    // 함수 5: 공개 제보 목록 - Resolved만 (누구나)
    // ───────────────────────────────────────────
    function getPublicReports() public view returns (ReportData[] memory) {
        // 1패스: Resolved 개수 세기
        uint256 count = 0;
        for (uint256 i = 1; i <= reportCount; i++) {
            if (reports[i].status == ReportStatus.Resolved) {
                count++;
            }
        }

        // 2패스: 배열 채우기
        ReportData[] memory result = new ReportData[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= reportCount; i++) {
            if (reports[i].status == ReportStatus.Resolved) {
                result[idx] = reports[i];
                // ipfsHash 숨기기 (공개 목록에서는 제거)
                result[idx].ipfsHash = "";
                idx++;
            }
        }

        return result;
    }

    // ───────────────────────────────────────────
    // 함수 6: 총 제보 수 조회
    // ───────────────────────────────────────────
    function getReportCount() public view returns (uint256) {
        return reportCount;
    }
}