import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import About from '@/components/landing/About'
import Programs from '@/components/landing/Programs'
import WhyChooseUs from '@/components/landing/WhyChooseUs'
import Impact from '@/components/landing/Impact'
import Testimonials from '@/components/landing/Testimonials'
import CallToAction from '@/components/landing/CallToAction'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Programs />
        <WhyChooseUs />
        <Impact />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
