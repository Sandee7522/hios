'use client'

import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GET_ALL_CATEGORY } from '@/app/dashboard/api'

export default function Programs() {
  const router = useRouter()

  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('categories')

  // =============================
  // 🔍 Debug logger (dev only)
  // =============================
  const debug = (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Programs]', ...args)
    }
  }

  // =============================
  // 📦 Fetch categories (safe)
  // =============================
  const fetchCategories = useCallback(async () => {
    try {
      debug('Fetching categories...')

      const res = await fetch(GET_ALL_CATEGORY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: '',
          page: 1,
          pageSize: 10,
          sort: 'desc',
          sortBy: 'created_at',
          isActive: true
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`)
      }

      const data = await res.json()

      debug('Category response:', data)

      if (data?.status === 200) {
        const list = data?.data?.data || []
        setPrograms(Array.isArray(list) ? list : [])
      } else {
        console.warn('⚠️ Unexpected category response', data)
        setPrograms([])
      }
    } catch (error) {
      console.error('❌ Category fetch error:', error)
      setPrograms([])
    } finally {
      setLoading(false)
    }
  }, [])

  // =============================
  // 🔄 Handle tab change
  // =============================
  const handleTabChange = (tab) => {
    debug('Tab changed:', tab)

    if (tab === 'courses') {
      debug('Redirecting to register page from Published Courses tab')
      router.push('/register')
      return
    }

    setActiveTab(tab)
  }

  // =============================
  // 🚀 Initial load
  // =============================
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <section id="programs" className="py-20 md:py-32 bg-[#020617] relative">
      <div className="absolute top-0 right-0 -z-10 w-150 h-150 bg-blue-900/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 md:px-6">
        {/* ================= Header ================= */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Popular Programs
            </h2>
            <p className="text-slate-400 text-lg font-light">
              Discover our most sought-after courses designed to build strong careers.
            </p>
          </motion.div>
        </div>

        {/* ================= Tabs ================= */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => handleTabChange('categories')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Categories
          </button>

          <button
            onClick={() => handleTabChange('courses')}
            className="px-6 py-2 rounded-lg font-medium transition-all bg-slate-800 text-slate-400 hover:bg-slate-700"
          >
            Published Courses
          </button>
        </div>

        {/* ================= Loading ================= */}
        {loading ? (
          <div className="text-center text-white">
            Loading categories...
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No categories available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={program._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card className="h-full bg-[#0f172a]/50 border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-900/50 to-slate-900 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                        {program.icon ? (
                          <img
                            src={program.icon}
                            alt={program.name}
                            className="h-10 w-10 object-contain"
                            onError={() => debug('Icon failed:', program.icon)}
                          />
                        ) : (
                          <BookOpen className="h-10 w-10" />
                        )}
                      </div>
                    </div>

                    <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">
                      {program.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-base mb-6 text-slate-400 leading-relaxed">
                      {program.description || 'No description available'}
                    </CardDescription>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/register?category=${program.slug}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 bg-transparent"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
