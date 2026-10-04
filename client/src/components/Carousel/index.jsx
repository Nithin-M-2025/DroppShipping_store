import {useState, useEffect} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'

import slideOne from '../../assets/carousel/carousel-1.jpg'
import slideTwo from '../../assets/carousel/carousel-2.jpg'
import slideThree from '../../assets/carousel/carousel-3.jpg'

import './index.css'

const slides = [
    {
        id: 1,
        image: slideOne,
        title: 'Shop with ease',
        text: 'Quick, secure checkout wherever you are.',
    },
    {
        id: 2,
        image: slideTwo,
        title: 'Gifts they will love',
        text: 'Find something thoughtful for everyone on your list.',
    },
    {
        id: 3,
        image: slideThree,
        title: 'Browse together',
        text: 'Explore the collection with friends and family.',
    },
]

const AUTO_PLAY_DELAY = 4000

const Carousel = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const goToNext = () => {
        setActiveIndex(prev => (prev + 1) % slides.length)
    }

    const goToPrevious = () => {
        setActiveIndex(prev => (prev - 1 + slides.length) % slides.length)
    }

    useEffect(() => {
        if (isPaused) {
            return undefined
        }

        const timerId = setTimeout(goToNext, AUTO_PLAY_DELAY)

        return () => clearTimeout(timerId)
    }, [activeIndex, isPaused])

    return (
        <div
            className="cs_carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className="cs_track"
                style={{transform: `translateX(-${activeIndex * 100}%)`}}
            >
                {slides.map((slide, index) => (
                    <div
                        className={`cs_slide ${
                            index === activeIndex ? 'cs_slide_active' : ''
                        }`}
                        key={slide.id}
                    >
                        <img
                            className="cs_image"
                            src={slide.image}
                            alt={slide.title}
                        />

                        <div className="cs_caption">
                            <h2 className="cs_caption_title">{slide.title}</h2>
                            <p className="cs_caption_text">{slide.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="cs_arrow cs_arrow_left"
                onClick={goToPrevious}
                aria-label="Previous slide"
            >
                <ChevronLeft size={20} />
            </button>

            <button
                type="button"
                className="cs_arrow cs_arrow_right"
                onClick={goToNext}
                aria-label="Next slide"
            >
                <ChevronRight size={20} />
            </button>

            <div className="cs_dots">
                {slides.map((slide, index) => (
                    <button
                        type="button"
                        key={slide.id}
                        className={`cs_dot ${
                            index === activeIndex ? 'cs_dot_active' : ''
                        }`}
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default Carousel