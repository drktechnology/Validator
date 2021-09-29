pragma solidity ^0.5.0;

/**
 * @title drkchain validator's metadata smart contract
 */

contract ValidatorMetadata {
    struct ValidatorProfile {
        bytes32 firstName;
        bytes32 lastName;
        bytes32 licenseId;
        string fullAddress;
        bytes32 state;
        bytes32 zipcode;
        uint expirationDate;
        uint createdDate;
        uint updatedDate;
        uint minThreshold;
        bytes32 contactEmail;
        bool isCompany;
    }

    event MetadataUpdated(address indexed _validator);

    mapping(address => ValidatorProfile) validatorProfiles;

    function _getValidatorName(address _validator) internal view returns (
        bytes32 firstName,
        bytes32 lastName
    ) {
        ValidatorProfile storage profile = validatorProfiles[_validator];
        firstName = profile.firstName;
        lastName = profile.lastName;
    }

    function _updateMetadata(
        address _validator,
        bytes32 _firstName,
        bytes32 _lastName,
        bytes32 _licenseId,
        string calldata _fullAddress,
        bytes32 _state,
        bytes32 _zipcode,
        uint _expirationDate,
        uint _createdDate,
        uint _updatedDate,
        uint _minThreshold,
        bytes32 _contactEmail,
        bool _isCompany
    ) internal {
        validatorProfiles[_validator] = ValidatorProfile(
            _firstName,
            _lastName,
            _licenseId,
            _fullAddress,
            _state,
            _zipcode,
            _expirationDate,
            _createdDate,
            _updatedDate,
            _minThreshold,
            _contactEmail,
            _isCompany
        );
        emit MetadataUpdated(_validator);
    }

    // this is format for blockscout
    function isValidatorAlreadyVoted(address _miningKey, address _voterMiningKey)
        external
        view
        returns(bool)
    {
        return true;
    }

    function getTime() external view returns(uint) {
        return now;
    }

    function getMinThreshold() external view returns(uint) {
        return 8;
    }

    function _validators(address _validator) internal view returns (
        bytes32 firstName,
        bytes32 lastName,
        bytes32 licenseId,
        string calldata fullAddress,
        bytes32 state,
        bytes32 zipcode,
        uint expirationDate,
        uint createdDate,
        uint updatedDate,
        uint minThreshold,
        bytes32 contactEmail,
        bool isCompany
    ) {
        ValidatorProfile calldata profile = validatorProfiles[_validator];
        firstName = profile.firstName;
        lastName = profile.lastName;
        licenseId = profile.licenseId;
        fullAddress = profile.fullAddress;
        state = profile.state;
        zipcode = profile.zipcode;
        expirationDate = profile.expirationDate;
        createdDate = profile.createdDate;
        updatedDate = profile.updatedDate;
        minThreshold = profile.minThreshold;
        contactEmail = profile.contactEmail;
        isCompany = profile.isCompany;
    }

}
