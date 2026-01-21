import { cn } from "cn-func";
import { useSetAtom } from "jotai";
import { EditPriceModalOpenAtom } from "../editPriceModal/atom";

// 1. 인터페이스에 부족했던 속성들을 추가합니다.
interface PriceSettingFieldProps {
  phoneBrand: string;
  telecom: "SKT" | "KT" | "LG U+";
  device: string;
  originalPrice: number; // 에러 해결 포인트
  commonDiscount: number; // 에러 해결 포인트
  options: {
    type: string;
    plan: string;
    price: number;
  }[];
}

const PriceSettingField = ({
  phoneBrand,
  telecom,
  device,
  originalPrice,
  commonDiscount,
  options,
}: PriceSettingFieldProps) => {
  const modalOpen = useSetAtom(EditPriceModalOpenAtom);
  const REQUIRED_TYPES = ["기기변경", "번호이동", "신규가입"] as const;

  return (
    <div className="flex flex-col rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm">
      {/* 화면에는 항상 LG U+ 로 표시 */}
      <div className="bg-blue-secondary p-2 text-xl font-bold text-center">
        {telecom}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <OptionGrid className="py-1 font-medium text-gray-dark border-b border-gray-50 text-xs">
          <span>가입 유형</span>
          <span>요금제</span>
          <span>단말기 가격</span>
          <span></span>
        </OptionGrid>
        {REQUIRED_TYPES.map((type) => {
          const opt = options.find((o) => o.type === type) || {
            type,
            plan: "",
            price: 0,
          };
          return (
            <div
              className="bg-blue-tertiary rounded-lg overflow-hidden text-base"
              key={type}
            >
              <OptionGrid>
                <span className="font-bold">{type}</span>
                <span className="truncate text-sm">
                  {opt.plan === "" ? "-" : opt.plan}
                </span>
                <div className="font-semibold text-blue-primary text-sm">
                  {opt.price === 0
                    ? "-"
                    : `${opt.price.toLocaleString("ko-KR")}원`}
                </div>
                <button
                  className="text-blue-primary font-bold hover:underline text-right text-xs"
                  onClick={() =>
                    modalOpen({
                      phoneBrand,
                      telecom, // 여기서 넘겨주는 'LG U+'는 API 호출 시 'LG U'로 변환됩니다.
                      device,
                      option: opt,
                      commonDiscount,
                      originalPrice,
                    })
                  }
                >
                  편집
                </button>
              </OptionGrid>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OptionGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "grid grid-cols-[1fr_1.3fr_1fr_45px] gap-2 px-4 py-3 items-center",
      className,
    )}
  >
    {children}
  </div>
);

export default PriceSettingField;
