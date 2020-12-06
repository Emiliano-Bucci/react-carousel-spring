import React, { useState, useRef, createContext } from 'react'
import { useSpring, config } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { Wrapper, CarouselWrapper, CarouselItemWrapper } from './index.styles'
import {
  Item,
  Props,
  ReactSpringCarouselContextProps as ContextProps
} from './typings'

export const ReactSpringCarouselContext = createContext<ContextProps>({
  activeItem: 0
})

export function ReactSpringCarousel<T extends Item>({
  items,
  withLoop = false,
  draggingSlideTreshold = 50,
  springConfig = config.default
}: Props<T>) {
  const internalItems = withLoop
    ? [items[items.length - 1], ...items, items[0]]
    : items
  const [activeItem, setActiveItem] = useState(0)
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)
  const isAnimating = useRef(false)
  const [carouselStyles, setCarouselStyles] = useSpring(() => ({
    x: 0,
    config: springConfig
  }))
  const bindDrag = useDrag(({ dragging, last, movement: [mx] }) => {
    const currentSlidedValue = -(getCarouselWrapperWidth() * activeItem)

    if (isAnimating.current) {
      return
    }

    if (dragging) {
      setCarouselStyles({ x: currentSlidedValue + mx })
      isDragging.current = true
    }

    if (last) {
      const prevItemTreshold = mx > draggingSlideTreshold
      const nextItemTreshold = mx < -draggingSlideTreshold

      if (nextItemTreshold) {
        if (!withLoop && activeItem === internalItems.length - 1) {
          setCarouselStyles({ x: currentSlidedValue })
        } else {
          handleSlideToNextItem()
        }
      } else if (prevItemTreshold) {
        if (!withLoop && activeItem === 0) {
          setCarouselStyles({ x: currentSlidedValue })
        } else {
          handleSlideToPrevItem()
        }
      } else {
        setCarouselStyles({ x: currentSlidedValue })
      }
    }
  })

  function getPrevItem() {
    return activeItem - 1
  }

  function getNextItem() {
    return activeItem + 1
  }

  function getCarouselWrapperWidth() {
    if (!carouselWrapperRef.current) {
      return 0
    }

    return carouselWrapperRef.current.getBoundingClientRect().width
  }

  function handleGoToItem({
    item,
    immediate = false,
    onRest = () => {}
  }: {
    item: number
    immediate?: boolean
    onRest?(): void
  }) {
    if (!immediate) {
      setActiveItem(item)
    }

    isAnimating.current = true

    setCarouselStyles({
      x: -(getCarouselWrapperWidth() * item),
      config: {
        ...springConfig,
        duration: immediate ? 0 : undefined
      },
      onRest: () => {
        isDragging.current = false
        isAnimating.current = false
        onRest()
      }
    })
  }

  function handleSlideToPrevItem() {
    if (
      (!withLoop && activeItem === 0) ||
      (isDragging.current && isAnimating.current)
    ) {
      return
    }

    if (withLoop && activeItem === 0) {
      if (isDragging.current) {
        handleGoToItem({
          item: getPrevItem(),
          onRest: () => {
            setActiveItem(internalItems.length - 3)
            handleGoToItem({
              item: internalItems.length - 3,
              immediate: true
            })
          }
        })
      } else {
        handleGoToItem({
          item: internalItems.length - 2,
          immediate: true,
          onRest: () => {
            handleGoToItem({
              item: internalItems.length - 3
            })
          }
        })
      }
      return
    }

    handleGoToItem({
      item: getPrevItem()
    })
  }

  function handleSlideToNextItem() {
    if (
      (!withLoop && activeItem === internalItems.length - 1) ||
      (isDragging.current && isAnimating.current)
    ) {
      return
    }

    if (withLoop && activeItem === internalItems.length - 3) {
      if (!isDragging.current) {
        handleGoToItem({
          item: -1,
          immediate: true,
          onRest: () => {
            handleGoToItem({
              item: 0
            })
          }
        })
      } else {
        handleGoToItem({
          item: getNextItem(),
          onRest: () => {
            setActiveItem(0)
            handleGoToItem({
              item: 0,
              immediate: true
            })
          }
        })
      }

      return
    }

    handleGoToItem({
      item: getNextItem()
    })
  }

  return (
    <ReactSpringCarouselContext.Provider
      value={{
        activeItem,
        getIsAnimating: () => isAnimating.current,
        getIsDragging: () => isDragging.current,
        getIsNextItem: (id) => {
          const itemIndex = items.findIndex((item) => item.id === id)
          return itemIndex - 1 === activeItem
        },
        getIsPrevItem: (id) => {
          const itemIndex = items.findIndex((item) => item.id === id)
          return itemIndex - 1 === activeItem - 2
        },
        slideToItem: (item, callback) => {
          handleGoToItem({
            item,
            onRest: callback
          })
        }
      }}
    >
      <Wrapper>
        <div
          onClick={handleSlideToPrevItem}
          style={{
            position: 'relative',
            background: 'blue',
            zIndex: 100
          }}
        >
          prev item
        </div>
        <CarouselWrapper
          {...bindDrag()}
          style={carouselStyles}
          ref={(ref) => {
            if (ref) {
              carouselWrapperRef.current = ref

              if (withLoop) {
                ref.style.left = `-${ref.getBoundingClientRect().width}px`
              }
            }
          }}
        >
          {internalItems.map(({ id, renderItem }, index) => (
            <CarouselItemWrapper key={`${id}-${index}`}>
              {renderItem}
            </CarouselItemWrapper>
          ))}
        </CarouselWrapper>
        <div
          style={{
            position: 'relative',
            background: 'blue',
            zIndex: 100
          }}
          onClick={handleSlideToNextItem}
        >
          next item
        </div>
      </Wrapper>
    </ReactSpringCarouselContext.Provider>
  )
}
