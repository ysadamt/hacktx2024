import React, { useCallback, useEffect, useRef } from 'react'
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType
} from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import {
  NextButton,
  PrevButton,
  usePrevNextButtons
} from './CartridgeCarouselArrowButtons'
import { SpotifyPlaylist } from '@/types/spotify'

const TWEEN_FACTOR_BASE = 0.52

const cartridges = [
  '/assets/cartridge-1.png',
  '/assets/cartridge-2.png',
  '/assets/cartridge-3.png',
  '/assets/cartridge-4.png'
]

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max)

type PropType = {
  slides: SpotifyPlaylist[]
  options?: EmblaOptionsType
  currentPlaylist: number
  setCurrentPlaylist: React.Dispatch<React.SetStateAction<number>>
}

const CartridgeCarousel: React.FC<PropType> = (props) => {
  const { slides, options, currentPlaylist, setCurrentPlaylist } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi, setCurrentPlaylist, slides.length || 0)

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.embla__slide__number') as HTMLElement
    })
  }, [])

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine()
      const scrollProgress = emblaApi.scrollProgress()
      const slidesInView = emblaApi.slidesInView()
      const isScrollEvent = eventName === 'scroll'

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress)
                }
              }
            })
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
          const scale = numberWithinRange(tweenValue, 0, 1).toString()
          const tweenNode = tweenNodes.current[slideIndex]
          tweenNode.style.transform = `scale(${scale})`
        })
      })
    },
    []
  )

  useEffect(() => {
    if (!emblaApi) return

    setTweenNodes(emblaApi)
    setTweenFactor(emblaApi)
    tweenScale(emblaApi)

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale)
  }, [emblaApi, tweenScale])

  return (
    <div className="embla">
      <div className="flex w-full justify-center py-4">
        <h2 className="text-6xl text-center">{slides[currentPlaylist] && slides[currentPlaylist].name}</h2>
      </div>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((playlist, index) => (
            <div className="embla__slide" key={index}>
              <img className="embla__slide__number" src={cartridges[index % cartridges.length]} // Cycle through cartridges
                alt={`Cartridge for ${playlist.name}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="embla__buttons">
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>
    </div>
  )
}

export default CartridgeCarousel;
