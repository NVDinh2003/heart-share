import React, {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";

import "./LocationModalContent.css";
import LocationSVG from "../../../../../components/SVGs/LocationSVG";
import { ValidatedLocationSelector } from "../../../../../components/ValidatedInput/ValidatedLocationSelector";
import {
  getDisplayLocationInfo,
  getDistricts,
  getLocationInfo,
  getProvinces,
  getWards,
} from "../../../utils/LocationUtils";
import { ValidatedTextInput } from "../../../../../components/ValidatedInput/ValidatedTextInput";
import { AppDispatch, RootState } from "../../../../../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { setLocationDetail } from "../../../../../redux/Slices/PostSlice";

interface LocationModalContentProps {
  setDispatchLocationDetail: Dispatch<SetStateAction<() => void>>;
}

export const LocationModalContent: React.FC<LocationModalContentProps> = ({
  setDispatchLocationDetail,
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [districtOptions, setDistrictOptions] = useState<JSX.Element[]>([]);
  const [wardOptions, setWardOptions] = useState<JSX.Element[]>([]);
  const [addressDetail, setAddressDetail] = useState<string>("");

  const postState = useSelector((state: RootState) => state.post.currentPost);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (selectedProvince) {
      const districts = getDistricts(selectedProvince);
      setDistrictOptions(districts);
    } else {
      setDistrictOptions([]);
      setSelectedDistrict("");
      setSelectedWard("");
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      const wards = getWards(selectedDistrict);
      setWardOptions(wards);
    } else {
      setWardOptions([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  // Thêm useEffect mới để khôi phục dữ liệu từ postState
  useEffect(() => {
    if (postState) {
      // console.log("postState: ", postState);
      setSelectedProvince(postState.provinceCode || "");
      setSelectedDistrict(postState.districtCode || "");
      setSelectedWard(postState.wardCode || "");
      setAddressDetail(postState.address || "");
    }
  }, [postState]);

  const updateLocationSelector = (
    name: string,
    value: string | number | boolean
  ) => {
    // console.log("name: ", name);
    if (name === "province" && typeof value === "string") {
      setSelectedProvince(value);
    }

    if (name === "district" && typeof value === "string") {
      setSelectedDistrict(value);
    }

    if (name === "ward" && typeof value === "string") {
      setSelectedWard(value);
    }
  };

  const dispatchLocationDetail = useCallback(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      // console.log("dispatchLocationDetail");
      dispatch(
        setLocationDetail({
          address: addressDetail,
          provinceCode: selectedProvince,
          districtCode: selectedDistrict,
          wardCode: selectedWard,
        })
      );
    }
  }, [
    dispatch,
    addressDetail,
    selectedProvince,
    selectedDistrict,
    selectedWard,
  ]);

  useEffect(() => {
    setDispatchLocationDetail(() => dispatchLocationDetail);
  }, [setDispatchLocationDetail, dispatchLocationDetail]);

  const handleAddressChange = (value: string) => {
    setAddressDetail(value); // Cập nhật địa chỉ chi tiết
  };

  const displayLocationInfo = () => {
    const { districtCode, provinceCode, wardCode, address } = postState || {};
    const isPostStateValid = districtCode && provinceCode && wardCode;
    const isSelectionValid =
      selectedProvince && selectedDistrict && selectedWard;

    if (!isPostStateValid && !isSelectionValid) {
      return "...";
    }

    const locationData = isPostStateValid
      ? { address, provinceCode, districtCode, wardCode }
      : {
          address: addressDetail,
          provinceCode: selectedProvince,
          districtCode: selectedDistrict,
          wardCode: selectedWard,
        };

    return `: ${getDisplayLocationInfo(locationData)}`;
  };

  return (
    <div className="location-modal-content">
      <div className="location-modal-content-top">
        <div className="location-modal-content-address-info">
          <LocationSVG height={20} width={20} color={"#1da1f2"} />
          <p className="location-modal-content-address-info-text">
            Địa chỉ đã chọn {displayLocationInfo()}
          </p>
        </div>
        <p className="location-modal-content-label">Địa chỉ chi tiết</p>
        <div className="location-modal-content-address-group">
          <div className="location-modal-content-address-input-wrapper">
            <ValidatedTextInput
              type="text"
              valid={true}
              name={"addressDetail"}
              label={""}
              changeValue={(e) => handleAddressChange(e.target.value)}
              data={addressDetail}
            />
          </div>
        </div>

        <p className="location-modal-content-label">Chọn địa chỉ</p>
        <div className="location-modal-content-detail-group">
          <div className="location-modal-content-province-selector-wrapper">
            <ValidatedLocationSelector
              name={"Tỉnh/TP"}
              valid={true}
              dropDown={getProvinces}
              dispatcher={updateLocationSelector}
              data={selectedProvince}
            />
          </div>

          <div className="location-modal-content-district-selector-wrapper">
            <ValidatedLocationSelector
              name={"Quận/Huyện"}
              valid={true}
              dropDown={() => districtOptions} // Sử dụng danh sách quận đã lọc
              dispatcher={updateLocationSelector}
              data={selectedDistrict}
            />
          </div>

          <div className="location-modal-content-ward-selector-wrapper">
            <ValidatedLocationSelector
              name={"Phường/Xã"}
              valid={true}
              dropDown={() => wardOptions} // Sử dụng danh sách phường đã lọc
              dispatcher={updateLocationSelector} // Cập nhật phường
              data={selectedWard} // Dữ liệu cho phường
            />
          </div>
        </div>
      </div>

      <div className="location-modal-content-bottom">
        <div className="location-modal-content-scheduled-post-bg">
          <p className="location-modal-content-scheduled-post"></p>
        </div>
      </div>
    </div>
  );
};
