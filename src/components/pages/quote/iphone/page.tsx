import { deviceData } from "../../../../contents/deviceData";
import Select from "../../../common/select";
import Header from "../../../layout/header";
import PageWrapper from "../../../layout/pageWrapper";
import { useQuotePage } from "../hooks/useQuotePage";
import PriceSettingField from "../priceSettingField";
import EditPriceModal from "../editPriceModal";

/**
 * 아이폰 기기 데이터 구조 정의
 * 갤럭시와 달리 출고가 속성명이 'price'인 점을 반영합니다.
 */
interface IPhoneDeviceItem {
  phoneName: string;
  phoneBrand: string;
  price: number;
}

const IPhoneQuotePage = () => {
  // 1. 커스텀 훅을 통해 로직 주입 (브랜드: apple)
  const {
    selectedOption,
    setSelectedOption,
    commonDiscounts,
    agencyPriceList,
  } = useQuotePage("apple");

  // 2. 애플 기기 목록 데이터 가져오기 (타입 단언)
  const data = deviceData.apple as IPhoneDeviceItem[];

  // 3. 현재 선택된 기기의 상세 정보 찾기
  const currentDevice = data.find((d) => d.phoneName === selectedOption?.name);

  return (
    <>
      <Header />
      <PageWrapper className="flex flex-col gap-4">
        {/* 기종 선택 셀렉트 박스 */}
        <Select.Group
          selectedOption={selectedOption}
          onChange={setSelectedOption}
        >
          {data.map((device) => (
            <Select.Option key={device.phoneName} name={device.phoneName} />
          ))}
        </Select.Group>

        {/* 기기가 선택되었을 때만 통신사별 시세 필드 노출 */}
        {selectedOption && (
          <div className="flex flex-col gap-4">
            {(["SKT", "KT", "LG U+"] as const).map((telecom) => {
              // 서버에서 가져온 시세 데이터 중 해당 통신사 데이터 매핑
              // (useQuotePage 훅에서 이미 'LG U'를 'LG U+'로 보정 완료)
              const savedData = agencyPriceList.find(
                (a) => a.telecom === telecom,
              );

              return (
                <PriceSettingField
                  key={telecom}
                  phoneBrand="apple"
                  device={selectedOption.name}
                  telecom={telecom}
                  // 아이폰 데이터의 'price'를 컴포넌트의 'originalPrice' 속성으로 전달합니다.
                  originalPrice={currentDevice?.price || 0}
                  // getSubsidy API로 조회된 공시 지원금
                  commonDiscount={commonDiscounts[telecom] || 0}
                  // 등록된 정보가 없으면 빈 배열 전달
                  options={savedData?.options || []}
                />
              );
            })}
          </div>
        )}
      </PageWrapper>

      {/* 편집 모달 - Jotai 상태에 따라 열림/닫힘 및 데이터 연동 */}
      <EditPriceModal />
    </>
  );
};

export default IPhoneQuotePage;
