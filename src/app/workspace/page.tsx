import Navbar from '@/components/Navbar';
import GuidelineSyncBar from '@/components/GuidelineSyncBar';
import SplitScreenContainer from '@/components/HUD/SplitScreenContainer';
import Footer from '@/components/Footer';

export default function WorkspacePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />
      <GuidelineSyncBar />

      {/* Main Content: offset for fixed navbar (64px) + sync bar (40px) */}
      <main className="flex-1 pt-[104px] pb-4 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto w-full">
        <SplitScreenContainer />
      </main>

      <Footer />
    </div>
  );
}
