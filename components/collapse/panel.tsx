import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import ConfigContext from '../config-provider/ConfigContext'
import { getCompProps } from '../_utils'
import Icon from '../icon'
import { IconPositionType, PanelKeyType } from './collapse'

export interface CollapsePanelProps {
  disabled?: boolean
  header?: React.ReactNode | ((props: CollapsePanelProps) => React.ReactNode)
  expandIcon?: React.ReactNode | ((props: CollapsePanelProps) => React.ReactNode)
  bordered?: boolean
  expandIconPosition?: IconPositionType
  onChange?: (key: PanelKeyType) => void
  extra?: React.ReactNode | ((props: CollapsePanelProps) => React.ReactNode)
  assist?: React.ReactNode | ((props: CollapsePanelProps) => React.ReactNode)
  expand?: boolean
  defaultExpand?: boolean
  children?: React.ReactNode
  panelKey?: PanelKeyType
  style?: React.CSSProperties
  className?: string
}
const Panel = React.forwardRef<unknown, CollapsePanelProps>((props, ref) => {
  const { getPrefixCls, prefixCls, compDefaultProps: userDefaultProps } = React.useContext(ConfigContext)
  const {
    disabled,
    extra,
    assist,
    header,
    onChange,
    panelKey,
    innerKey,
    bordered,
    expandIcon,
    expandIconPosition,
    style,
    title,
    className,
    children,
    prefixCls: customPrefixcls,
    ...others
  } = getCompProps('CollapsePanel', userDefaultProps, props)

  const panelPrefixCls = getPrefixCls!(prefixCls, 'collapse-panel', customPrefixcls)

  const childrenRef = useRef<HTMLDivElement | null>(null)
  const setHeightTimerRef = useRef<NodeJS.Timeout | null>(null)
  const setAutoHeightTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [expandAnimation, setExpandAnimation] = useState<boolean | null>(null)
  const [expand, setExpand] = useState<boolean>(false)

  useEffect(() => {
    const newValue = innerKey.includes(panelKey)
    if (newValue !== expand) {
      setExpand(newValue)
      setExpandAnimation(true)
    }
  }, [innerKey])

  const handleClick = () => {
    if (disabled) return
    onChange && onChange(panelKey)
  }
  const renderIcon = () => {
    const iconClassName = classNames({
      [`${panelPrefixCls}-icon`]: true,
      [`${panelPrefixCls}-animation-expand`]: !expand,
      [`${panelPrefixCls}-animation-collapse`]: expand,
      [`${panelPrefixCls}-disabled`]: disabled,
    })
    return (
      <span className={iconClassName} onClick={handleClick}>
        {expandIcon ? renderReactNode(expandIcon) : <Icon type="arrow-right-solid" />}
      </span>
    )
  }

  const renderLeft = () => {
    const className = classNames({
      [`${panelPrefixCls}-left`]: true,
      [`${panelPrefixCls}-disabled`]: disabled,
    })
    const headerClassName = classNames({
      [`${panelPrefixCls}-header`]: true,
      [`${panelPrefixCls}-disabled`]: disabled,
    })
    return (
      <span className={className} onClick={handleClick}>
        {expandIconPosition === 'left' ? renderIcon() : null}
        {header && (
          <span className={headerClassName} title={title}>
            {renderReactNode(header)}
          </span>
        )}
      </span>
    )
  }

  const renderRight = () => {
    if (typeof extra === 'undefined' && expandIconPosition !== 'right') return
    const className = classNames({
      [`${panelPrefixCls}-right`]: true,
      [`${panelPrefixCls}-disabled`]: disabled,
    })
    return (
      <span className={className}>
        {extra && <span className={`${panelPrefixCls}-extra`}>{renderReactNode(extra)}</span>}
        {expandIconPosition === 'right' ? renderIcon() : null}
      </span>
    )
  }

  const renderMiddle = () => {
    if (typeof assist === 'undefined') return
    const className = classNames({
      [`${panelPrefixCls}-middle`]: true,
      [`${panelPrefixCls}-disabled`]: disabled,
    })
    return (
      <span className={className}>
        {assist && <span className={`${panelPrefixCls}-assist`}>{renderReactNode(assist)}</span>}
      </span>
    )
  }

  const renderReactNode = (reactNode: React.ReactNode) => {
    if (typeof reactNode === 'function') {
      return reactNode()
    }
    return reactNode
  }

  const rootClassName = classNames(className, {
    [`${panelPrefixCls}`]: true,
    [`${panelPrefixCls}-border`]: bordered,
    [`${panelPrefixCls}-opened`]: expand,
  })
  const topClassName = classNames({
    [`${panelPrefixCls}-top`]: true,
    [`${panelPrefixCls}-disabled`]: disabled,
    [`${panelPrefixCls}-top-border`]: bordered && expand,
    [`${panelPrefixCls}-no-assist`]: !assist,
  })
  const childrenClassName = classNames({
    [`${panelPrefixCls}-children`]: expand,
    [`${panelPrefixCls}-children-hide`]: !expand,
  })
  const childrenBorderedClassName = classNames({
    [`${panelPrefixCls}-children-bordered`]: bordered,
  })
  const runExpandAnimation = (element: HTMLElement) => {
    element.style.height = '0px'
    element.style.opacity = '0'
    setHeightTimerRef.current && clearTimeout(setHeightTimerRef.current)
    setHeightTimerRef.current = setTimeout(() => {
      element.style.display = 'block'
      element.style.opacity = '1'
      element.style.height = `${element.scrollHeight}px`
    }, 10)
    setAutoHeightTimerRef.current && clearTimeout(setAutoHeightTimerRef.current)
    setAutoHeightTimerRef.current = setTimeout(() => {
      element.style.height = 'auto'
    }, 350)
  }
  const runCollapseAnimation = (element: HTMLElement) => {
    setAutoHeightTimerRef.current && clearTimeout(setAutoHeightTimerRef.current)
    element.style.height = `${element.scrollHeight}px`
    setAutoHeightTimerRef.current = setTimeout(() => {
      element.style.height = '0px'
      element.style.opacity = '0'
    }, 0)
  }

  const expandWithoutAnimation = (element: HTMLElement) => {
    element.style.height = 'auto'
    element.style.opacity = '1'
  }

  const panelPrefixClsRef = (ref as React.RefObject<HTMLDivElement>) || React.createRef<HTMLElement>()

  React.useLayoutEffect(() => {
    if (!childrenRef.current) return
    if (expandAnimation) {
      expand ? runExpandAnimation(childrenRef.current) : runCollapseAnimation(childrenRef.current)
      setExpandAnimation(false)
    } else if (!expandAnimation) {
      expand ? expandWithoutAnimation(childrenRef.current) : runCollapseAnimation(childrenRef.current)
    }
  }, [childrenRef.current, expandAnimation, expand])

  return (
    <div className={rootClassName} style={style} ref={panelPrefixClsRef} {...others}>
      <span className={topClassName}>
        {renderLeft()}
        {renderMiddle()}
        {renderRight()}
      </span>
      <div className={childrenClassName} ref={childrenRef}>
        <div className={childrenBorderedClassName}>{children}</div>
      </div>
    </div>
  )
})

Panel.displayName = 'Panel'
export default Panel
