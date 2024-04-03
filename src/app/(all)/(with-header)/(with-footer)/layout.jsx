import Footer from '@/components/footer/Footer';



export default function FooterLayout({ children }) {
  return (
    <div className='text-zinc-800 pb-[230px]' >
      {children}
      <Footer />
    </div>
  );
}
