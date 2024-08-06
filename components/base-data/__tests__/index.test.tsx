import React from 'react'
import { mount } from 'enzyme'
import ConfigProvider from '../../config-provider'
import { IAdvancedSelectorProps, SelectValue } from '../interface'
import BaseData from '../index'

const defaultselectProps: IAdvancedSelectorProps<SelectValue> = {
  onChange: jest.fn(),
  onSearch: jest.fn(),
  onSelect: jest.fn(),
  onShowDetail: jest.fn(),
  onShowMore: jest.fn(),
  onCollect: jest.fn(),
}

describe('BaseData', () => {
  it('should have displayName static property', () => {
    const wrapper = mount(<BaseData />)
    expect((wrapper.type() as any).displayName).toBe('BaseData')
  })
  // Test config provider
  it('should config use config provider', () => {
    const localeData = {}
    const basedataConfig = {
      compDefaultProps: {
        BaseData: {
          disabled: true,
        },
      },
      localeConfig: { localeData, locale: 'zh-CN' },
    }
    const wrapper = mount(
      <ConfigProvider value={basedataConfig}>
        <BaseData {...defaultselectProps} />
      </ConfigProvider>,
    )
    expect(wrapper.find('.kd-baseData')).toHaveClassName('.kd-baseData-disabled')
  })
})
