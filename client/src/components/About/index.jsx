import {useEffect, useRef, useState} from 'react'
import {Leaf, Truck, Heart, Sparkles} from 'lucide-react'

import './index.css'

const stats = [
    {id: 1, label: 'Happy customers', target: 24000, suffix: '+'},
    {id: 2, label: 'Products crafted', target: 850, suffix: '+'},
    {id: 3, label: 'Years in business', target: 12, suffix: ''},
    {id: 4, label: 'Countries shipped to', target: 38, suffix: '+'},
]

const values = [
    {
        id: 1,
        icon: Leaf,
        title: 'Sustainably made',
        text: 'We choose organic fabrics and low-impact processes wherever we can.',
    },
    {
        id: 2,
        icon: Heart,
        title: 'Built to last',
        text: 'Every piece is designed to be worn for years, not seasons.',
    },
    {
        id: 3,
        icon: Truck,
        title: 'Shipped with care',
        text: 'Fast, carbon-conscious delivery, packed in recyclable materials.',
    },
    {
        id: 4,
        icon: Sparkles,
        title: 'Honest quality',
        text: 'No filler, no shortcuts — just thoughtfully made essentials.',
    },
]

// Reveals an element with a fade-up animation the first time it scrolls into view
const useRevealOnScroll = () => {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const node = ref.current
        if (!node) return undefined

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(node)
                }
            },
            {threshold: 0.2},
        )

        observer.observe(node)

        return () => observer.disconnect()
    }, [])

    return [ref, isVisible]
}

// Counts a number up from 0 once its section becomes visible
const useCountUp = (target, isVisible, duration = 1400) => {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (!isVisible) return undefined

        let startTime = null
        let frameId = null

        const step = timestamp => {
            if (startTime === null) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - (1 - progress) * (1 - progress)

            setValue(Math.floor(eased * target))

            if (progress < 1) {
                frameId = requestAnimationFrame(step)
            } else {
                setValue(target)
            }
        }

        frameId = requestAnimationFrame(step)

        return () => cancelAnimationFrame(frameId)
    }, [isVisible, target, duration])

    return value
}

const StatItem = ({stat, isVisible}) => {
    const count = useCountUp(stat.target, isVisible)

    return (
        <div className="ab_stat">
            <p className="ab_stat_number">
                {count.toLocaleString()}
                {stat.suffix}
            </p>
            <p className="ab_stat_label">{stat.label}</p>
        </div>
    )
}

const About = () => {
    const [heroRef, heroVisible] = useRevealOnScroll()
    const [storyRef, storyVisible] = useRevealOnScroll()
    const [statsRef, statsVisible] = useRevealOnScroll()
    const [valuesRef, valuesVisible] = useRevealOnScroll()
    const [ctaRef, ctaVisible] = useRevealOnScroll()

    return (
        <div className="ab_page">
            {/* Hero */}
            <section
                className={`ab_hero ${heroVisible ? 'ab_visible' : ''}`}
                ref={heroRef}
            >
                <span className="ab_shape ab_shape_one" />
                <span className="ab_shape ab_shape_two" />
                <span className="ab_shape ab_shape_three" />

                <p className="ab_eyebrow">Our story</p>
                <h1 className="ab_hero_title">
                    Clothes made to be
                    <span className="ab_hero_title_italic"> worn, not wasted</span>
                </h1>
                <p className="ab_hero_text">
                    We started this store with one simple idea — build fewer,
                    better things, and stand behind every stitch.
                </p>
            </section>

            {/* Story */}
            <section
                className={`ab_story ${storyVisible ? 'ab_visible' : ''}`}
                ref={storyRef}
            >
                <div className="ab_story_card">
                    <h2 className="ab_section_heading">How it started</h2>
                    <p className="ab_story_text">
                        What began as a small workshop has grown into a store
                        trusted by thousands. We still design every piece the
                        same way we did on day one — slowly, carefully, and with
                        materials that will hold up to real, everyday life.
                    </p>
                    <p className="ab_story_text">
                        Today, our team works with small mills and family-run
                        factories who share our obsession with quality over
                        quantity.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section
                className={`ab_stats_section ${statsVisible ? 'ab_visible' : ''}`}
                ref={statsRef}
            >
                <div className="ab_stats_grid">
                    {stats.map(stat => (
                        <StatItem
                            key={stat.id}
                            stat={stat}
                            isVisible={statsVisible}
                        />
                    ))}
                </div>
            </section>

            {/* Values */}
            <section
                className={`ab_values ${valuesVisible ? 'ab_visible' : ''}`}
                ref={valuesRef}
            >
                <h2 className="ab_section_heading ab_values_heading">
                    What we stand for
                </h2>

                <div className="ab_values_grid">
                    {values.map((value, index) => {
                        const Icon = value.icon

                        return (
                            <div
                                className="ab_value_card"
                                key={value.id}
                                style={{transitionDelay: `${index * 0.1}s`}}
                            >
                                <div className="ab_value_icon">
                                    <Icon size={22} />
                                </div>
                                <h3 className="ab_value_title">{value.title}</h3>
                                <p className="ab_value_text">{value.text}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* CTA */}
            <section
                className={`ab_cta ${ctaVisible ? 'ab_visible' : ''}`}
                ref={ctaRef}
            >
                <h2 className="ab_cta_title">Ready to find your next favorite?</h2>
                <p className="ab_cta_text">
                    Explore the collection and see what everyone's talking about.
                </p>
                <a href="/" className="ab_cta_button">
                    Shop the collection
                </a>
            </section>
        </div>
    )
}

export default About