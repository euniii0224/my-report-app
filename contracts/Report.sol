// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Report {

    enum ReportStatus {
        Submitted,
        UnderReview,
        Resolved,
        Rejected
    }

    struct ReportData {
        uint256 id;
        address reporter;
        string ipfsHash;
        string category;
        ReportStatus status;
        uint256 timestamp;
        bytes32 trackingCode;
    }

    struct Comment {
        uint256 id;
        uint256 reportId;
        address author;
        string content;
        uint256 timestamp;
        bool hidden;
    }

    address public owner;
    mapping(address => bool) public admins;
    address[] private adminList; // 관리자 목록 배열
    uint256 private reportCount;
    uint256 private commentCount;
    uint256 public totalDonated;

    mapping(uint256 => ReportData) private reports;
    mapping(bytes32 => uint256) private trackingToId;
    mapping(uint256 => Comment[]) private reportComments;

    event ReportSubmitted(uint256 indexed id, bytes32 trackingCode, address reporter);
    event StatusUpdated(uint256 indexed id, ReportStatus newStatus);
    event CommentAdded(uint256 indexed reportId, uint256 commentId, address author);
    event CommentHidden(uint256 indexed reportId, uint256 commentIndex);
    event CommentUnhidden(uint256 indexed reportId, uint256 commentIndex);
    event Donated(address indexed donor, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can call this");
        _;
    }

    modifier reportExists(uint256 _id) {
        require(_id > 0 && _id <= reportCount, "Report does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
        adminList.push(msg.sender);
    }

    // 관리자 추가 (owner만)
    function addAdmin(address _admin) public onlyOwner {
        require(_admin != address(0), "Invalid address");
        require(!admins[_admin], "Already an admin");
        admins[_admin] = true;
        adminList.push(_admin);
        emit AdminAdded(_admin);
    }

    // 관리자 삭제 (owner만)
    function removeAdmin(address _admin) public onlyOwner {
        require(_admin != owner, "Cannot remove owner");
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        // 배열에서 제거
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == _admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        emit AdminRemoved(_admin);
    }

    // 관리자 여부 확인
    function isAdmin(address _addr) public view returns (bool) {
        return admins[_addr];
    }

    // 관리자 목록 조회 (owner만)
    function getAdminList() public view onlyOwner returns (address[] memory) {
        return adminList;
    }

    function submitReport(
        string memory _ipfsHash,
        string memory _category
    ) public returns (bytes32) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
        require(bytes(_category).length > 0, "Category is required");

        reportCount++;
        uint256 newId = reportCount;

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

    function updateStatus(
        uint256 _id,
        ReportStatus _newStatus
    ) public onlyAdmin reportExists(_id) {
        ReportStatus current = reports[_id].status;
        require(
            current != ReportStatus.Resolved && current != ReportStatus.Rejected,
            "Cannot change final status"
        );
        reports[_id].status = _newStatus;
        emit StatusUpdated(_id, _newStatus);
    }

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
        return (r.id, r.category, r.status, r.timestamp);
    }

    function getAllReports() public view onlyAdmin returns (ReportData[] memory) {
        ReportData[] memory result = new ReportData[](reportCount);
        for (uint256 i = 1; i <= reportCount; i++) {
            result[i - 1] = reports[i];
        }
        return result;
    }

    function getPublicReports() public view returns (ReportData[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= reportCount; i++) {
            if (reports[i].status == ReportStatus.Resolved) {
                count++;
            }
        }

        ReportData[] memory result = new ReportData[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= reportCount; i++) {
            if (reports[i].status == ReportStatus.Resolved) {
                result[idx] = reports[i];
                idx++;
            }
        }
        return result;
    }

    function getReportCount() public view returns (uint256) {
        return reportCount;
    }

    // 관리자 후원
    function donate() public payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        totalDonated += msg.value;
        payable(owner).transfer(msg.value);
        emit Donated(msg.sender, msg.value);
    }

    // 댓글 등록 (누구나)
    function addComment(
        uint256 _reportId,
        string memory _content
    ) public reportExists(_reportId) {
        require(
            reports[_reportId].status == ReportStatus.Resolved,
            "Can only comment on resolved reports"
        );
        require(bytes(_content).length > 0, "Content is required");

        commentCount++;
        reportComments[_reportId].push(Comment({
            id:        commentCount,
            reportId:  _reportId,
            author:    msg.sender,
            content:   _content,
            timestamp: block.timestamp,
            hidden:    false
        }));

        emit CommentAdded(_reportId, commentCount, msg.sender);
    }

    // 댓글 숨김 처리 (관리자만)
    function hideComment(
        uint256 _reportId,
        uint256 _commentIndex
    ) public onlyAdmin reportExists(_reportId) {
        require(_commentIndex < reportComments[_reportId].length, "Comment does not exist");
        reportComments[_reportId][_commentIndex].hidden = true;
        emit CommentHidden(_reportId, _commentIndex);
    }

    // 댓글 숨김 해제 (관리자만)
    function unhideComment(
        uint256 _reportId,
        uint256 _commentIndex
    ) public onlyAdmin reportExists(_reportId) {
        require(_commentIndex < reportComments[_reportId].length, "Comment does not exist");
        reportComments[_reportId][_commentIndex].hidden = false;
        emit CommentUnhidden(_reportId, _commentIndex);
    }

    // 댓글 조회 - hidden 제외 (누구나)
    function getComments(
        uint256 _reportId
    ) public view reportExists(_reportId) returns (Comment[] memory) {
        Comment[] storage all = reportComments[_reportId];

        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!all[i].hidden) count++;
        }

        Comment[] memory result = new Comment[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!all[i].hidden) {
                result[idx] = all[i];
                idx++;
            }
        }
        return result;
    }

    // 관리자용 전체 댓글 조회 - hidden 포함
    function getAllComments(
        uint256 _reportId
    ) public view onlyAdmin reportExists(_reportId) returns (Comment[] memory) {
        return reportComments[_reportId];
    }
}