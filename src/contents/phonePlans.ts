export const phonePlans = {
  SKT: [
    {
      name: "5GX 플래티넘",
      price: 125000,
      description: "가족과 OTT,데이터를 쓸레요",
    },
    {
      name: "5GX 프리미엄",
      price: 109000,
      description: "OTT도보고. 노트북,테블릿도 함께써요",
    },
    {
      name: "5GX 프라임 플러스",
      price: 99000,
      description: "저렴한 무제한 데이터와 OTT를 누릴래요",
    },
    // {
    //   name: "5GX 프라임",
    //   price: 89000,
    //   description: "저는 오직 무제한 데이터만 필요해요",
    // },
    // {
    //   name: "5GX 레귤러",
    //   price: 69000,
    //   description: "출퇴근할 때 영상시청을 자주해요",
    // },
    // {
    //   name: "슬림",
    //   price: 55000,
    //   description: "웹서핑을 합리적인 가격으로 이용할래요",
    // },
    //{ name: "컴팩트", price: 39000, description: "카톡, 연락만 하면 충분해요" },
  ],
  KT: [
    {
      name: "5G 초이스 프리미엄",
      price: 130000,
      description: "고화질 OTT, 가족과 함께 데이터를 쓸레요",
    },
    {
      name: "5G 초이스 스페셜",
      price: 110000,
      description: "OTT도보고. 노트북,테블릿도 함께써요",
    },
    {
      name: "5G 초이스 베이직",
      price: 90000,
      description: "저렴한 무제한 데이터와 OTT를 누릴래요",
    },
    // {
    //   name: "5G 베이직",
    //   price: 80000,
    //   description: "저는 오직 무제한 데이터만 필요해요",
    // },
    // {
    //   name: "5G 심플 100GB",
    //   price: 69000,
    //   description: "출퇴근할 때 영상시청을 자주해요",
    // },
    // {
    //   name: "5G 슬림 14GB",
    //   price: 55000,
    //   description: "웹서핑을 합리적인 가격으로 이용할래요",
    // },
    // {
    //   name: "5G 슬림 4GB",
    //   price: 37000,
    //   description: "카톡, 연락만 하면 충분해요",
    // },
  ],
  "LG U+": [
    {
      name: "5G 시그니처",
      price: 130000,
      description: "고화질 OTT, 가족과 함께 데이터를 쓸레요",
    },
    {
      name: "5G 프리미엄 슈퍼",
      price: 115000,
      description: "OTT도보고. 노트북,테블릿도 함께써요",
    },
    {
      name: "5G 프리미어 플러스",
      price: 105000,
      description: "저렴한 무제한 데이터와 OTT를 누릴래요",
    },
    // {
    //   name: "5G 프리미어 에센셜",
    //   price: 85000,
    //   description: "저는 오직 무제한 데이터만 필요해요",
    // },
    // {
    //   name: "5G 데이터 슈퍼",
    //   price: 68000,
    //   description: "출퇴근할 때 영상시청을 자주해요",
    // },
    // {
    //   name: "5G 라이트 +",
    //   price: 55000,
    //   description: "웹서핑을 합리적인 가격으로 이용할래요",
    // },
    // {
    //   name: "5G 미니 +",
    //   price: 37000,
    //   description: "카톡, 연락만 하면 충분해요",
    // },
  ],
};

/**
 * 요금제 배열 순서에 따라 군(群) 정보를 반환합니다.
 * @param index 요금제 배열의 인덱스 (0부터 시작)
 * @returns 군 정보 (예: "115군", "105군", "95군")
 */
export const getPlanGroup = (index: number): string => {
  if (index === 0) {
    return "115군";
  } else if (index === 1) {
    return "105군";
  } else if (index === 2) {
    return "95군";
  }
  return "";
};
