import * as React from 'react'
import classNames from 'classnames'
import isBoolean from 'lodash/isBoolean'
import ConfigContext from '../config-provider/ConfigContext'
import { getCompProps } from '../_utils'
import Icon from '../icon'
import Dropdown, { DropDownProps } from '../dropdown'
import devWarning from '../_utils/devwarning'
import { tuple } from '../_utils/type'
export const PageTypes = tuple('basic', 'bill', 'simple', 'less', 'nicety')
export const TotalTypes = tuple('page', 'row', 'all')
export type pageType = typeof PageTypes[number]
export type totalType = typeof TotalTypes[number]

export interface IIcons {
  first: React.ReactElement
  last: React.ReactElement
  prev: React.ReactElement
  next: React.ReactElement
  down: React.ReactElement
  jumpPrev: React.ReactElement
  jumpNext: React.ReactElement
}

export interface IPaginationProps {
  bordered?: boolean
  className?: string
  current?: number
  defaultCurrent?: number
  defaultPageSize?: number
  disabled?: boolean
  dropdownProps?: DropDownProps
  hideOnSinglePage?: boolean
  icons?: Partial<IIcons>
  pageSize?: number
  pageSizeOptions?: Array<string | number>
  prefixCls?: string
  pageType?: pageType
  showQuickJumper?: boolean | { goButton?: React.ReactNode }
  showSizeChanger?: boolean
  showTitle?: boolean
  showTotal?: boolean | totalType
  style?: React.CSSProperties
  total?: number
  onChange?: (page: number, pageSize?: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

const Pagination: React.FC<IPaginationProps> = (props) => {
  const {
    getPrefixCls,
    prefixCls: pkgPrefixCls,
    compDefaultProps: userDefaultProps,
    locale,
    direction,
  } = React.useContext(ConfigContext)
  const paginationLangMsg = locale.getCompLangMsg({ componentName: 'Pagination' })
  // 属性需要合并一遍用户定义的默认属性
  const {
    style,
    total,
    current,
    pageSize,
    disabled,
    onChange,
    pageType,
    bordered,
    showTitle,
    className,
    dropdownProps,
    defaultCurrent,
    showQuickJumper,
    defaultPageSize,
    pageSizeOptions,
    showSizeChanger,
    onShowSizeChange,
    hideOnSinglePage,
    icons,
    prefixCls: customPrefixcls,
  } = getCompProps('Pagination', userDefaultProps, props)
  devWarning(PageTypes.indexOf(pageType) === -1, 'Pagination', `cannot found pageType '${pageType}'`)
  // className前缀
  const prefixCls = getPrefixCls!(pkgPrefixCls, 'pagination', customPrefixcls)
  const rtlCls = direction === 'rtl' ? `${prefixCls}-rtl` : null
  // 每页显示的记录条数
  const [size, setSize] = React.useState(pageSize || defaultPageSize)
  React.useEffect(() => {
    pageSize !== undefined && setSize(pageSize)
  }, [pageSize])

  // 总页数
  const totalPage = Math.max(Math.ceil(total / size), 1)

  // 当前页码
  const initPage = Math.min(totalPage, current || defaultCurrent)
  const [page, setPage] = React.useState(Math.max(initPage, 1))
  React.useEffect(() => {
    current !== undefined && setPage(current)
  }, [current])

  // 输入的页码
  const [inputPage, setInputPage] = React.useState<string | undefined>(undefined)

  // 是否显示pageSize切换器
  const showSizeSelector = isBoolean(showSizeChanger) ? showSizeChanger : total > 50

  const defaultShowQuickJumper = pageType !== 'bill'
  const showJumper = showQuickJumper === undefined ? defaultShowQuickJumper : showQuickJumper

  // pageSize切换器是否展开
  const [isOpen, setIsOpen] = React.useState(false)

  // icons
  const innerIcon: IIcons = Object.assign(
    {
      first: <Icon type={`${direction === 'rtl' ? 'last' : 'first'}`} />,
      last: <Icon type={`${direction === 'rtl' ? 'first' : 'last'}`} />,
      prev: <Icon type={`arrow-${direction === 'rtl' ? 'right' : 'left'}`} />,
      next: <Icon type={`arrow-${direction === 'rtl' ? 'left' : 'right'}`} />,
      down: <Icon type="arrow-down" />,
      jumpPrev: <Icon type={`double-arrow-${direction === 'rtl' ? 'right' : 'left'}`} />,
      jumpNext: <Icon type={`double-arrow-${direction === 'rtl' ? 'left' : 'right'}`} />,
    },
    icons || {},
  )

  // 切换pageSize
  const handleChangeSize = (key: string) => {
    const currentSize = Number(key)
    if (currentSize !== size) {
      if (pageSize === undefined) setSize(currentSize)

      const currentPage = Math.min(Math.ceil(total / Number(currentSize)), page)
      changePage(currentPage, currentSize)

      onShowSizeChange && onShowSizeChange(currentPage, currentSize)
    }
    setIsOpen(false)
  }

  // 输入页码
  const handleChangeCurrentPage = (e: React.ChangeEvent<HTMLInputElement>) => setInputPage(e.target.value)

  // 回车确定页码
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirmCurrentPage()
  }

  // 页码输入框回车或者失去焦点确定翻到输入的页码
  const handleConfirmCurrentPage = () => {
    if (inputPage !== undefined) {
      // 正整数正则表达式
      const inputReg = new RegExp(`^-?\\d+$`)

      if (inputReg.test(inputPage)) {
        if (Number(inputPage) < 1) changePage(1)
        else if (Number(inputPage) > totalPage) changePage(totalPage)
        else changePage(Number(inputPage))
      }

      setInputPage(undefined)
    }
  }

  // 翻页
  const changePage = (page: number, pageSize?: number) => {
    current === undefined && setPage(page)
    onChange && onChange(page, pageSize || size)
  }

  // 翻到上一页
  const handlePrev = () => changePage(page - 1)

  // 翻到下一页
  const handleNext = () => changePage(page + 1)

  // 翻到第一页
  const handleFirst = () => changePage(1)

  // 翻到最后一页
  const handleLast = () => changePage(totalPage)

  // 向前跳转
  const jumpPrev = () => changePage(page - 5 || 1)

  // 向后跳转
  const jumpNext = () => changePage(page + 5 < totalPage ? page + 5 : totalPage)

  const itemAttr = (prefix: string, title: string, active?: boolean) => ({
    className: classNames({
      [`${prefixCls}-${prefix}`]: true,
      bordered,
      active,
    }),
    title: showTitle ? title : undefined,
  })

  // 生成元素是连续数字的数组
  function genArray(start: number, end: number): Array<number> {
    const result = []
    for (let i = start; i <= end; i++) {
      result.push(i)
    }
    return result
  }

  function dropdownVisibleChange(visible: boolean) {
    setIsOpen(visible)
    if (dropdownProps && typeof dropdownProps.onVisibleChange === 'function') {
      dropdownProps.onVisibleChange(visible)
    }
  }

  const sizeOptions = (
    <Dropdown.Menu>
      {pageSizeOptions.map((size: number) => (
        <Dropdown.Item key={size}>
          {pageType === 'nicety' ? size : locale.getLangMsg('Pagination', 'perPage', { size })}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  )

  const mapShowTotal: Record<string, string> = {
    basic: 'page',
    nicety: 'row',
  }
  const mapTotalText: Record<string, React.ReactNode> = {
    page: locale.getLangMsg('Pagination', 'page', { page: totalPage }),
    row: locale.getLangMsg('Pagination', 'row', { row: total }),
    all: locale.getLangMsg('Pagination', 'total', { page: totalPage, row: total }),
  }
  const showTotal = props.showTotal ? (props.showTotal === true ? 'page' : props.showTotal) : mapShowTotal[pageType]
  const Total = showTotal && <span className={`${prefixCls}-total`}>{mapTotalText[showTotal]}</span>

  const normalPagination = (
    <div className={classNames(prefixCls, rtlCls, className)} style={style}>
      {Total}
      {showJumper && (
        <span className={`${prefixCls}-current`}>
          {locale.getLangMsg('Pagination', 'order', {
            order: (
              <input
                type="text"
                disabled={disabled}
                onKeyUp={handleKeyUp}
                onBlur={handleConfirmCurrentPage}
                onChange={handleChangeCurrentPage}
                className={`${prefixCls}-current-input`}
                value={inputPage === undefined ? page : inputPage}
              />
            ),
          })}
        </span>
      )}
      <ul className={`${prefixCls}-action`}>
        <li {...itemAttr('action-item', paginationLangMsg.first)}>
          <button onClick={handleFirst} disabled={page === 1 || disabled}>
            {innerIcon.first}
          </button>
        </li>
        <li {...itemAttr('action-item', paginationLangMsg.prevPage)}>
          <button onClick={handlePrev} disabled={page === 1 || disabled}>
            {innerIcon.prev}
          </button>
        </li>
        <li {...itemAttr('action-item', paginationLangMsg.nextPage)}>
          <button onClick={handleNext} disabled={page === totalPage || disabled}>
            {innerIcon.next}
          </button>
        </li>
        <li {...itemAttr('action-item', paginationLangMsg.last)}>
          <button onClick={handleLast} disabled={page === totalPage || disabled}>
            {innerIcon.last}
          </button>
        </li>
      </ul>
      {showSizeSelector && (
        <div className={`${prefixCls}-selector`}>
          <Dropdown
            selectable
            selectedKey={size}
            menu={sizeOptions}
            trigger="click"
            placement="bottomLeft"
            disabled={disabled}
            prefix={`${prefixCls}-dropdown`}
            popperStyle={{ minWidth: 64 }}
            onItemClick={handleChangeSize}
            getPopupContainer={(triggerNode) => triggerNode?.parentElement as HTMLElement}
            {...dropdownProps}
            onVisibleChange={dropdownVisibleChange}
          >
            <button
              className={classNames(`${prefixCls}-selector-size`, `${prefixCls}-options-dropdown`, {
                [`${prefixCls}-options-dropdown-open`]: isOpen,
              })}
            >
              <span>{locale.getLangMsg('Pagination', 'perPage', { size })}</span>
              {innerIcon.down}
            </button>
          </Dropdown>
        </div>
      )}
    </div>
  )

  const simplePagination = (
    <div className={classNames(prefixCls, rtlCls, 'simple', className)} style={style}>
      {Total}
      <ul className={classNames(`${prefixCls}-action`, { bordered, disabled })}>
        <li {...itemAttr('action-item', paginationLangMsg.prevPage)}>
          <button onClick={handlePrev} disabled={page === 1 || disabled}>
            {innerIcon.prev}
          </button>
        </li>
        <li {...itemAttr('action-item', `${page}/${totalPage}`)}>
          <span className={`${prefixCls}-current`}>
            {showJumper ? (
              <input
                type="text"
                disabled={disabled}
                onKeyUp={handleKeyUp}
                onBlur={handleConfirmCurrentPage}
                onChange={handleChangeCurrentPage}
                className={`${prefixCls}-current-input`}
                value={inputPage === undefined ? page : inputPage}
              />
            ) : (
              page
            )}
          </span>
          / <span className={`${prefixCls}-total`}>{totalPage}</span>
        </li>
        <li {...itemAttr('action-item', paginationLangMsg.nextPage)}>
          <button onClick={handleNext} disabled={page === totalPage || disabled}>
            {innerIcon.next}
          </button>
        </li>
      </ul>
    </div>
  )

  const lessPages = genArray(1, totalPage)
  let lessPagination: React.ReactElement | null = null

  if (pageType === 'less') {
    lessPagination = (
      <div className={classNames(prefixCls, rtlCls, 'less', { bordered, disabled }, className)} style={style}>
        {Total}
        <ul className={`${prefixCls}-pages`}>
          <li {...itemAttr('pages-item', paginationLangMsg.prevPage)}>
            <button onClick={handlePrev} disabled={page === 1 || disabled}>
              {innerIcon.prev}
            </button>
          </li>
          {lessPages.map((item, index) => (
            <li key={index} {...itemAttr('pages-item', String(item), item === page)}>
              <button onClick={() => changePage(item)} disabled={disabled}>
                {item}
              </button>
            </li>
          ))}
          <li {...itemAttr('pages-item', paginationLangMsg.nextPage)}>
            <button onClick={handleNext} disabled={page === totalPage || disabled}>
              {innerIcon.next}
            </button>
          </li>
        </ul>
      </div>
    )
  }

  const nicetyPages: Array<number | string> = lessPages

  if (totalPage >= 8) {
    nicetyPages.length = 0
    if (page < 5) {
      nicetyPages.push(...genArray(1, 5))
    } else if (page > totalPage - 4) {
      nicetyPages.push(...genArray(totalPage - 4, totalPage))
    } else {
      nicetyPages.push(...genArray(page - 2, page + 2))
    }

    page <= totalPage - 4 && nicetyPages.push('>>', totalPage)

    page >= 5 && nicetyPages.unshift(1, '<<')
  }

  const nicetyPagination = (
    <div className={classNames(prefixCls, rtlCls, 'nicety', { bordered, disabled }, className)} style={style}>
      {Total}
      <ul className={`${prefixCls}-pages`}>
        <li {...itemAttr('pages-item', paginationLangMsg.prevPage)}>
          <button onClick={handlePrev} disabled={page === 1 || disabled}>
            {innerIcon.prev}
          </button>
        </li>
        {nicetyPages.map((item, index) => {
          const handleChangePage = () =>
            typeof item === 'string' ? (item === '<<' ? jumpPrev() : jumpNext()) : changePage(item)
          const pageText = typeof item === 'string' ? '...' : item
          const jumperIconType = item === '<<' ? innerIcon.jumpPrev : innerIcon.jumpNext
          const title =
            typeof item === 'string' ? paginationLangMsg[item === '<<' ? 'forward' : 'backward'] : String(item)
          return (
            <li key={index} {...itemAttr('pages-item', title, item === page)}>
              <button onClick={handleChangePage} disabled={disabled}>
                {pageText}
                {typeof item === 'string' &&
                  React.cloneElement(jumperIconType, {
                    className: `${prefixCls}-pages-jumper-icon`,
                  })}
              </button>
            </li>
          )
        })}
        <li {...itemAttr('pages-item', paginationLangMsg.nextPage)}>
          <button onClick={handleNext} disabled={page === totalPage || disabled}>
            {innerIcon.next}
          </button>
        </li>
      </ul>
      {showJumper && (
        <div className={`${prefixCls}-jumper`}>
          <input
            type="text"
            disabled={disabled}
            onKeyUp={handleKeyUp}
            onBlur={handleConfirmCurrentPage}
            onChange={handleChangeCurrentPage}
            className={`${prefixCls}-jumper-input`}
            value={inputPage === undefined ? '' : inputPage}
          />
          <button className={`${prefixCls}-jumper-button`} disabled={disabled} onClick={handleConfirmCurrentPage}>
            {paginationLangMsg.confirm}
          </button>
        </div>
      )}
      {showSizeSelector && (
        <div className={`${prefixCls}-options`}>
          {locale.getLangMsg('Pagination', 'perPage', {
            size: (
              <Dropdown
                selectable
                trigger="click"
                selectedKey={size}
                menu={sizeOptions}
                disabled={disabled}
                popperStyle={{ minWidth: 64 }}
                onItemClick={handleChangeSize}
                getPopupContainer={(triggerNode) => triggerNode?.parentElement as HTMLElement}
                placement="bottomLeft"
                {...dropdownProps}
                onVisibleChange={dropdownVisibleChange}
              >
                <button
                  className={classNames(`${prefixCls}-options-size`, `${prefixCls}-options-dropdown`, {
                    [`${prefixCls}-options-dropdown-open`]: isOpen,
                  })}
                >
                  {size}
                  {innerIcon.down}
                </button>
              </Dropdown>
            ),
          })}
        </div>
      )}
    </div>
  )

  const mapPagination: { [key: string]: React.ReactElement | null } = {
    basic: normalPagination,
    bill: normalPagination,
    simple: simplePagination,
    less: lessPagination,
    nicety: nicetyPagination,
  }

  return hideOnSinglePage && totalPage === 1 ? null : mapPagination[pageType] || mapPagination.basic
}

Pagination.displayName = 'Pagination'

export default Pagination
