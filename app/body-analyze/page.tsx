import BodyAnalysisSection from "@/components/home/BodyAnalysisSection"
import MainHeader from '@/components/MainHeader';


const bodyAnalyze = () => {
    return (

        <>
            {/* MainHeader для странцы Profile */}

            <MainHeader />

            <section className="py-6 sm:py-8 lg:py-12 w-full">
                <BodyAnalysisSection />
            </section>
        </>
    )
}

export default bodyAnalyze