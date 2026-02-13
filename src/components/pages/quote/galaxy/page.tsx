import { deviceData } from "../../../../contents/deviceData";
import Select from "../../../common/select";
import Header from "../../../layout/header";
import PageWrapper from "../../../layout/pageWrapper";
import { useQuotePage } from "../hooks/useQuotePage";
import PriceSettingField from "../priceSettingField";

// 기기 데이터 구조 정의
interface DeviceItem {
  phoneName: string;
  phoneBrand: string;
  originalPrice: number;
}

const GalaxyQuotePage = () => {
  const {
    selectedOption,
    setSelectedOption,
    commonDiscounts,
    agencyPriceList,
  } = useQuotePage("samsung");

  const data = deviceData.samsung as DeviceItem[];
  const currentDevice = data.find((d) => d.phoneName === selectedOption?.name);

  return (
    <>
      <Header />
      <PageWrapper className="flex flex-col gap-4">
        <Select.Group
          selectedOption={selectedOption}
          onChange={setSelectedOption}
        >
          {data.map((device) => (
            <Select.Option key={device.phoneName} name={device.phoneName} />
          ))}
        </Select.Group>

        {selectedOption && (
          <div className="flex flex-col gap-4">
            {(["SKT", "KT", "LG U+"] as const).map((telecom) => {
              // 이미 훅(useQuotePage)에서 'LG U'를 'LG U+'로 변환해두었으므로 find가 작동합니다.
              const savedData = agencyPriceList.find(
                (a) => a.telecom === telecom,
              );

              return (
                <PriceSettingField
                  key={telecom}
                  phoneBrand="samsung"
                  device={selectedOption.name}
                  telecom={telecom}
                  originalPrice={currentDevice?.originalPrice || 0}
                  commonDiscount={commonDiscounts[telecom] || 0}
                  options={savedData?.options || []}
                />
              );
            })}
          </div>
        )}
      </PageWrapper>

    </>
  );
};

export default GalaxyQuotePage;
