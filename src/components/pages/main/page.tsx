import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../layout/header";
import PageWrapper from "../../layout/pageWrapper";
import QuoteDetail from "./quoteDetail";
import QuoteInfo from "./quoteInfo";
import QuoteList from "./quoteList";
import { getStatusAgencyApi, getStatusAgencyResponse } from "../../../apis";

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [statusAgency, setStatusAgency] =
    useState<getStatusAgencyResponse | null>(null);
  const [selectedQuoteCode, setSelectedQuoteCode] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getStatusAgencyApi();
        setStatusAgency(data);
      } catch (error) {
        console.error("현황 데이터 로딩 실패");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading)
    return <div className="p-20 text-center">데이터를 불러오는 중...</div>;

  return (
    <>
      <Header />
      <PageWrapper className="flex flex-col gap-5">
        <QuoteInfo statusAgency={statusAgency} />
        <div className="flex flex-row gap-5">
          <QuoteList
            selectedQuoteCode={selectedQuoteCode}
            setSelectedQuoteCode={setSelectedQuoteCode}
          />
          <QuoteDetail selectedQuoteCode={selectedQuoteCode} />
        </div>
      </PageWrapper>
    </>
  );
};

export default MainPage;
