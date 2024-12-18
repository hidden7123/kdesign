import React, { FC, useContext, useState, useRef, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { ConfigContext } from '../config-provider'
import { Input } from '../index'
import { validateColor } from './utils/validateColor'
import { colorTypes } from './constant/colorTypes'
import { IColorTypesObj, IColorPickerProps, ColorTypes } from './interface'
import ColorPickerPanel from './color-picker-panel'
import { colorFormat, strFixed, getColorObj, highlightPresetColorIndex, presetColorToHEX } from './utils/colorFormat'
import { defaultSystemColor } from './constant/defaultColor'
import Color from 'color'
import { getCompProps } from '../_utils'
import usePopper from '../_utils/usePopper'
import { systemPresetColor } from './constant/systemPresetColor'

const ColorPicker: FC<Partial<IColorPickerProps>> = (props) => {
  const { getPrefixCls, prefixCls, compDefaultProps: userDefaultProps } = useContext(ConfigContext)
  const colorPickerProps = getCompProps('ColorPicker', userDefaultProps, props)
  const {
    value,
    className,
    style,
    pure,
    functionalColor,
    functionalColorName,
    switchName,
    showAlphaInput,
    showClear,
    showSwitch,
    showColorTransfer,
    showPresetColor,
    showColorPickerBox,
    format,
    panelFormatConfig,
    borderType,
    presetColor,
    historicalColor,
    placeholder,
    defaultValue,
    defaultOpen,
    visible,
    suffixIcon,
    prefixIcon,
    onChange,
    onVisibleChange,
  } = colorPickerProps
  const [inputColorValue, setInputColorValue] = useState<string>(defaultValue || '')
  const [inputCorrectColorValue, setInputCorrectColorValue] = useState<string>('')
  const [correctColorValue, setCorrectColorValue] = useState<string>(defaultValue || defaultSystemColor)
  const [currentColorType, setCurrentColorType] = useState<IColorTypesObj['type']>(panelFormatConfig.default)
  const [colTypeArr, setColTypeArr] = useState<Array<IColorTypesObj>>(colorTypes as IColorTypesObj[])
  const [showPanel, setShowPanel] = useState<boolean>(typeof visible === 'undefined' ? !!defaultOpen : !!visible)
  const [alpha, setAlpha] = useState<number>(0)
  const [alphaNoVerifyVal, setAlphaNoVerifyVal] = useState<string>(alpha * 100 + '%')
  const [isFollow, setIsFollow] = useState<boolean>(false)
  const [clickedPresetColorIndex, setClickedPresetColorIndex] = useState<number>()
  const [clickedHistoricalColorIndex, setClickedHistoricalColorIndex] = useState<number>()

  const colorPickerPrefixCls = getPrefixCls!(prefixCls, 'color-picker')
  const popUpLayer = getPrefixCls!(prefixCls, 'color-picker-pop')
  const containerCls = classNames(`${colorPickerPrefixCls}-container`, {
    [`${colorPickerPrefixCls}-container-pure`]: pure,
  })
  const inputCls = classNames(`${colorPickerPrefixCls}-input`, className)
  const inputRef = useRef<HTMLInputElement>(null)
  const showColorPickerPanel =
    showColorTransfer ||
    (typeof showPresetColor === 'boolean' && showPresetColor && (presetColor?.length || systemPresetColor.length)) ||
    typeof showPresetColor === 'undefined' ||
    showClear ||
    historicalColor?.length ||
    (functionalColor?.length && showSwitch) ||
    showColorPickerBox?.showBox ||
    showColorPickerBox?.showHue ||
    showColorPickerBox?.showOpacity

  const setClickColorIndex = (value: string | number) => {
    if (typeof value === 'number') {
      setClickedPresetColorIndex(value)
      setClickedHistoricalColorIndex(value)
    } else {
      setClickedPresetColorIndex(highlightPresetColorIndex(value, presetColorToHEX(presetColor || systemPresetColor)))
      setClickedHistoricalColorIndex(highlightPresetColorIndex(value, presetColorToHEX(historicalColor)))
    }
  }

  const setIconColor = (value: string) => {
    value === functionalColorName ? setIsFollow(true) : setIsFollow(false)
    const inpValue = value === functionalColorName ? functionalColor : value
    const inputValType = validateColor(inpValue)
    const setState = (formatArr: Array<IColorTypesObj>, correctColorValue: string, alpha: number, alphaStr: string) => {
      setColTypeArr(formatArr)
      setCorrectColorValue(correctColorValue)
      setAlpha(alpha)
      setAlphaNoVerifyVal(alphaStr)
    }
    const getAlphaStr = (color: string) => {
      return (strFixed(Color(getColorObj(color)).alpha(), 2) * 100).toFixed() + '%'
    }
    if (inputValType) {
      const formatArr = colorFormat(inpValue, strFixed(Color(getColorObj(inpValue)).alpha(), 2)) as IColorTypesObj[]
      setState(
        formatArr,
        colorFormat(inpValue, 1, currentColorType as Exclude<typeof ColorTypes[number], 'themeColor'>, true) as string,
        Color(getColorObj(inpValue)).alpha(),
        getAlphaStr(inpValue),
      )
      setClickColorIndex(formatArr[0].value)
    } else if (inpValue) {
      const formatArr = colorFormat(correctColorValue, alpha) as IColorTypesObj[]
      setState(formatArr, correctColorValue, alpha, alphaNoVerifyVal)
    } else {
      const formatArr = colorFormat(defaultSystemColor, 0) as IColorTypesObj[]
      setState(formatArr, defaultSystemColor, 0, '0%')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClickColorIndex(-1)
    const inpValue = e.target.value
    if (!inpValue) setInputCorrectColorValue('')
    if (value === undefined) {
      setIconColor(inpValue)
    }
    setInputColorValue(inpValue)
    const callback = (val: string, alpha: number) => {
      const formatArr = colorFormat(val, alpha) as IColorTypesObj[]
      onChange?.(inpValue, formatArr)
    }
    if (validateColor(inpValue)) {
      callback(inpValue, alpha)
    } else {
      callback(defaultSystemColor, alpha)
    }
    functionalColor && showSwitch && setIsFollow(false)
  }

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inpValue = e.target.value
    const formatArr = colorFormat(correctColorValue, alpha) as IColorTypesObj[]
    const getCurrentOutputColor = () => {
      if (inputCorrectColorValue) {
        return formatArr.find((item) => item.type === format)!.value
      }
      return ''
    }
    if (value === undefined) {
      setIconColor(inpValue)
      setInputColorValue(getCurrentOutputColor())
    }
    onChange?.(getCurrentOutputColor(), formatArr)
  }

  const handleClick = () => {
    if (typeof visible === 'undefined') {
      setShowPanel(!showPanel)
    }
    onVisibleChange && onVisibleChange(!showPanel)
  }

  useEffect(() => {
    if (validateColor(value ?? inputColorValue)) {
      setInputCorrectColorValue(value ?? inputColorValue)
    }
  }, [inputColorValue, value])

  useEffect(() => {
    if (typeof visible !== 'undefined') {
      setShowPanel(visible)
    }
  }, [visible])

  useEffect(() => {
    if (value !== undefined) {
      setIconColor(value)
    } else {
      if (defaultValue) {
        setIconColor(defaultValue)
      }
    }
  }, [value, defaultValue])

  const beforeIcon = useCallback(() => {
    const afterIconContainerCls = classNames(`${colorPickerPrefixCls}-icon`, {
      [`${colorPickerPrefixCls}-icon-underline`]: borderType === 'underline',
      [`${colorPickerPrefixCls}-icon-bordered`]: borderType === 'bordered',
    })

    const noneLineCls = `${colorPickerPrefixCls}-icon-no-color-line`
    return (
      <div
        className={afterIconContainerCls}
        style={{ backgroundColor: `${colTypeArr[2].value || defaultSystemColor}` }}
      >
        {!validateColor(value) && !inputCorrectColorValue && <div className={noneLineCls} />}
      </div>
    )
  }, [borderType, colTypeArr, colorPickerPrefixCls, inputCorrectColorValue, value])

  const colorInputEle = (
    <div className={containerCls} ref={inputRef}>
      <Input
        borderType={pure ? 'bordered' : borderType}
        placeholder={placeholder}
        value={value ?? inputColorValue}
        className={inputCls}
        onChange={handleChange}
        onBlur={handleBlur}
        style={style}
        onClick={handleClick}
        prefix={
          <div onClick={handleClick} className={`${colorPickerPrefixCls}-icon-container`}>
            {prefixIcon ? prefixIcon(colTypeArr[2].value, beforeIcon()) : beforeIcon()}
          </div>
        }
        suffix={
          suffixIcon && (
            <div onClick={handleClick} className={`${colorPickerPrefixCls}-icon-container`}>
              {suffixIcon(colTypeArr[2].value, beforeIcon())}
            </div>
          )
        }
      ></Input>
    </div>
  )

  const panel = (
    <ColorPickerPanel
      // API
      showAlphaInput={showAlphaInput}
      showClear={showClear}
      showSwitch={showSwitch}
      showColorTransfer={showColorTransfer}
      showPresetColor={showPresetColor}
      showColorPickerBox={showColorPickerBox}
      functionalColor={functionalColor}
      functionalColorName={functionalColorName}
      switchName={switchName}
      format={format}
      panelFormatConfig={panelFormatConfig}
      presetColor={presetColor}
      historicalColor={historicalColor}
      value={value}
      visible={visible}
      showPanel={showPanel}
      onVisibleChange={onVisibleChange}
      // private
      setInputCorrectColorValue={setInputCorrectColorValue}
      setInputColorValue={setInputColorValue}
      setCorrectColorValue={setCorrectColorValue}
      setClickedPresetColorIndex={setClickedPresetColorIndex}
      setClickedHistoricalColorIndex={setClickedHistoricalColorIndex}
      setClickColorIndex={setClickColorIndex}
      setAlpha={setAlpha}
      setAlphaNoVerifyVal={setAlphaNoVerifyVal}
      setIsFollow={setIsFollow}
      setShowPanel={setShowPanel}
      setColTypeArr={setColTypeArr}
      setCurrentColorType={setCurrentColorType}
      correctColorValue={correctColorValue}
      inputCorrectColorValue={inputCorrectColorValue}
      clickedPresetColorIndex={clickedPresetColorIndex}
      clickedHistoricalColorIndex={clickedHistoricalColorIndex}
      onChange={onChange}
      alpha={alpha}
      alphaNoVerifyVal={alphaNoVerifyVal}
      isFollow={isFollow}
      inputRef={inputRef}
      colTypeArr={colTypeArr}
      currentColorType={currentColorType}
      showColorPickerPanel={showColorPickerPanel}
    />
  )

  const popperProps = {
    ...colorPickerProps,
    popperClassName: popUpLayer,
    placement: 'bottomLeft',
    defaultVisible: showPanel,
    visible: showPanel,
    onVisibleChange: null,
    clickToClose: false,
  }

  return usePopper(colorInputEle, panel, popperProps)
}

ColorPicker.displayName = 'ColorPicker'

export default ColorPicker
