import React from 'react'
import Links from './Links'
import General from './General'
import NetworkingAndTransport from './NetworkingAndTransport'
import NAT from './NAT'
import DataAccess from './DataAccess'
import RestService from './RestService'
import Certificates from './Certificates'
import AccessControlLists from './AccessControlLists'
import SettingsBreadcrumbs from './SettingsBreadcrumbs'
import { hasValue } from '../common/utils'
import { observer, inject } from 'mobx-react'

class Settings extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            updated: false,
            config: {},
            currentSection: 'home',
            userAgent: '',
            bindAddr: '',
            externAddr: '',
            localnets: '',
            transportPorts: {
                udp: '',
                tcp: '',
                tls: '',
                ws: '',
                wss: ''
            },
            registrarIntf: 'Internal',
            recordRoute: false,
            aclDeny: '',
            aclAllow: '',
            dsProvider: 'files_data_provider',
            dsParameters: '',
            restBindAddr: '',
            restPort: '',
            restMinThreads: '',
            restMaxThreads: '',
            restTimeOutMillis: '',
            restKeyStorePath: '',
            restTrueStorePath: '',
            restKeyStorePassword: '',
            restTrueStorePassword: '',
            scKeyStorePath: '',
            scTrueStorePath: '',
            scKeyStorePassword: '',
            scTrueStorePassword: '',
            scDebugging: false,
            scClientAuthType: 'DisabledAll',
            scSSLv3: false,
            scTLSv1: false,
            scTLSv11: false,
            scTLSv12: false,
            restUnsecured: false
        }
    }

    componentDidUpdate(props) {
        if (this.state.updated === true) return

        const config = props.apiStore.getConfig()
        let dsProvider = ''
        let dsParameters = ''
        let aclDeny = ''
        let aclAllow = ''
        if (config.spec.dataSource) {
            dsProvider = config.spec.dataSource.provider
            dsParameters = config.spec.dataSource.parameters
        }
        if (config.spec.accessControlList) {
            aclDeny = config.spec.accessControlList.deny.join('\n')
            aclAllow = config.spec.accessControlList.allow.join('\n')
        }
        const transportPorts = {}

        config.spec.transport.forEach(transport => {
            transportPorts[transport.protocol] = transport.port
        })

        const scTLSv1 = config.spec.securityContext.client.protocols.filter(
          p => p === 'TLSv1').length > 0
        const scTLSv11 = config.spec.securityContext.client.protocols.filter(
          p => p === 'TLSv1.1').length > 0
        const scTLSv12 = config.spec.securityContext.client.protocols.filter(
          p => p === 'TLSv1.2').length > 0
        const scSSLv3 = config.spec.securityContext.client.protocols.filter(
          p => p === 'SSLv3').length > 0

        this.setState({
            userAgent: config.metadata.userAgent,
            bindAddr: config.spec.bindAddr,
            externAddr: config.spec.externAddr,
            localnets: config.spec.localnets,
            registrarIntf: config.spec.registrarIntf,
            recordRoute: config.spec.recordRoute,
            restBindAddr: config.spec.restService.bindAddr,
            restPort: config.spec.restService.port,
            restMinThreads: config.spec.restService.minThreads,
            restMaxThreads:config.spec.restService.maxThreads,
            restTimeOutMillis: config.spec.restService.timeOutMillis,
            restKeyStorePath: config.spec.restService.keyStore,
            restTrueStorePath: config.spec.restService.trueStore,
            restKeyStorePassword: config.spec.restService.keyStorePassword,
            restTrueStorePassword: config.spec.restService.trueStorePassword,
            restUnsecured: config.spec.restService.unsecured,
            scKeyStorePath: config.spec.securityContext.keyStore,
            scTrueStorePath: config.spec.securityContext.trueStore,
            scKeyStorePassword: config.spec.securityContext.keyStorePassword,
            scTrueStorePassword: config.spec.securityContext.trueStorePassword,
            scClientAuthType: config.spec.securityContext.client.authType,
            scDebugging: config.spec.securityContext.debugging,
            scTLSv1,
            scTLSv11,
            scTLSv12,
            scSSLv3,
            dsParameters,
            dsProvider,
            aclDeny,
            aclAllow,
            config,
            updated: true,
            transportPorts
        })
    }

    handleSave = () => {
        // Convert back to correct format
        const config = this.state.config
        const state = this.state
        if (!config.spec.dataSource) config.spec.dataSource = {}
        if (!config.spec.accessControlList) config.spec.accessControlList = {}
        if (!config.metadata) config.metadata = {}

        config.metadata.userAgent = state.userAgent
        config.spec.bindAddr = state.bindAddr
        config.spec.externAddr = state.externAddr
        config.spec.localnets = state.localnets.toString().split('\n')
        config.spec.registrarIntf = state.registrarIntf
        config.spec.recordRoute = state.recordRoute
        config.spec.dataSource.provider = state.dsProvider
        config.spec.dataSource.parameters = state.dsParameters
        config.spec.accessControlList.deny = state.aclDeny.toString().split('\n')
        config.spec.accessControlList.allow = state.aclAllow.toString().split('\n')
        config.spec.restService.bindAddr = state.restBindAddr
        config.spec.restService.port = state.restPort
        config.spec.restService.minThreads = state.restMinThreads
        config.spec.restService.maxThreads = state.restMaxThreads
        config.spec.restService.timeOutMillis = state.restTimeOutMillis
        config.spec.restService.keyStore= state.restKeyStorePath
        config.spec.restService.trueStore = state.restTrueStorePath
        config.spec.restService.keyStorePassword = state.restKeyStorePassword
        config.spec.restService.trueStorePassword = state.restTrueStorePassword
        config.spec.restService.unsecured = state.restUnsecured
        config.spec.securityContext.keyStore= state.scKeyStorePath
        config.spec.securityContext.trueStore = state.scTrueStorePath
        config.spec.securityContext.keyStorePassword = state.scKeyStorePassword
        config.spec.securityContext.trueStorePassword = state.scTrueStorePassword
        config.spec.securityContext.debugging = state.scDebugging
        config.spec.securityContext.client.authType = state.scClientAuthType

        const tlsProtocols = []
        if (state.scTLSv1) tlsProtocols.push('TLSv1')
        if (state.scTLSv11) tlsProtocols.push('TLSv1.1')
        if (state.scTLSv12) tlsProtocols.push('TLSv1.2')
        if (state.scSSLv3) tlsProtocols.push('SSLv3')

        config.spec.securityContext.client.protocols = tlsProtocols

        const transport = []
        const transportPorts = this.state.transportPorts

        if (hasValue(transportPorts.udp))
          transport.push({ protocol: 'udp', port: transportPorts.udp})
        if (hasValue(transportPorts.tcp))
          transport.push({ protocol: 'tcp', port: transportPorts.tcp})
        if (hasValue(transportPorts.tls))
          transport.push({ protocol: 'tls', port: transportPorts.tls})
        if (hasValue(transportPorts.ws))
          transport.push({ protocol: 'ws', port: transportPorts.ws})
        if (hasValue(transportPorts.wss))
          transport.push({ protocol: 'wss', port: transportPorts.wss})

        config.spec.transport = transport

        console.log('config =>', JSON.stringify(config))
        // save
        this.props.apiStore.saveConfig(config)
        this.setState({currentSection: 'home'})
    }
    handleOnCancel = () => this.setState({currentSection: 'home', updated: false})
    isSection = name => this.state.currentSection === name
    handleChangeSection = section => this.setState({currentSection: section, updated: false})
    handleChange = e => {
        const id = e.currentTarget.id
        const value = e.target.value
        const transportPorts = this.state.transportPorts
        if (id === 'userAgent') this.setState({userAgent: value})
        if (id === 'bindAddr') this.setState({bindAddr: value})
        if (id === 'externAddr') this.setState({externAddr: value})
        if (id === 'localnets') this.setState({localnets: value})
        if (id === 'dsProvider') this.setState({dsProvider: value})
        if (id === 'dsParameters') this.setState({dsParameters: value})
        if (id === 'registrarIntf') this.setState({registrarIntf: value})
        if (id === 'aclDeny') this.setState({aclDeny: value})
        if (id === 'aclAllow') this.setState({aclAllow: value})
        if (id === 'recordRoute') this.setState({recordRoute: e.target.checked})
        if (id === 'udpPort') { transportPorts.udp = value; this.setState({transportPorts})}
        if (id === 'tcpPort') { transportPorts.tcp = value; this.setState({transportPorts})}
        if (id === 'tlsPort') { transportPorts.tls = value; this.setState({transportPorts})}
        if (id === 'wsPort') { transportPorts.ws = value; this.setState({transportPorts})}
        if (id === 'wssPort') { transportPorts.wss = value; this.setState({transportPorts})}
        if (id === 'restBindAddr') this.setState({restBindAddr: value})
        if (id === 'restPort') this.setState({restPort: value})
        if (id === 'restMinThreads') this.setState({restMinThreads: value})
        if (id === 'restMaxThreads') this.setState({restMaxThreads: value})
        if (id === 'restTimeOutMillis') this.setState({restTimeOutMillis: value})
        if (id === 'restKeyStorePath') this.setState({restKeyStorePath: value})
        if (id === 'restTrueStorePath') this.setState({restTrueStorePath: value})
        if (id === 'restKeyStorePassword') this.setState({restKeyStorePassword: value})
        if (id === 'restTrueStorePassword') this.setState({restTrueStorePassword: value})
        if (id === 'restUnsecured') this.setState({restUnsecured: e.target.checked})
        if (id === 'scKeyStorePath') this.setState({scKeyStorePath: value})
        if (id === 'scTrueStorePath') this.setState({scTrueStorePath: value})
        if (id === 'scKeyStorePassword') this.setState({scKeyStorePassword: value})
        if (id === 'scTrueStorePassword') this.setState({scTrueStorePassword: value})
        if (id === 'scClientAuthType') this.setState({scClientAuthType: value})
        if (id === 'scDebugging') this.setState({scDebugging: e.target.checked})
        if (id === 'scTLSv1') this.setState({scTLSv1: e.target.checked})
        if (id === 'scTLSv11') this.setState({scTLSv11: e.target.checked})
        if (id === 'scTLSv12') this.setState({scTLSv12: e.target.checked})
        if (id === 'scSSLv3') this.setState({scSSLv3: e.target.checked})
    }

    render(props) {
      return (
        <div>
          <SettingsBreadcrumbs onChangeSection={this.handleChangeSection}
            currentSection={this.state.currentSection}/>
          {
            this.isSection('general') &&
            <General
              config={this.state}
              onChange={this.handleChange}
              onSave={this.handleSave}
              onCancel={this.handleOnCancel} />
          }
          {
            this.isSection('nat') &&
            <NAT
              config={this.state}
              onChange={this.handleChange}
              onSave={this.handleSave}
              onCancel={this.handleOnCancel} />
          }
          {
            this.isSection('access_control_lists') &&
            <AccessControlLists
              config={this.state}
              onChange={this.handleChange}
              onSave={this.handleSave}
              onCancel={this.handleOnCancel} />
          }
          {
            this.isSection('networking_and_transport') &&
            <NetworkingAndTransport
              config={this.state}
              onChange={this.handleChange}
              onSave={this.handleSave}
              onCancel={this.handleOnCancel} />
          }
          {
            this.isSection('rest_service') &&
            <RestService
              config={this.state}
              onChange={this.handleChange}
              onSave={this.handleSave}
              onCancel={this.handleOnCancel} />
          }
          {
            this.isSection('certificates') &&
            <Certificates
              config={this.state}
              onChange={this.handleChange}
              onSave={this.handleSave}
              onCancel={this.handleOnCancel} />
          }
          {
            this.isSection('data_access') &&
            <DataAccess
              config={this.state}
              onChange={this.handleChange}
              onSave={this.handleSave}
              onCancel={this.handleOnCancel} />
          }
          {
            this.state.currentSection === 'home' &&
            <Links onChangeSection={this.handleChangeSection} />
          }
        </div>
      )
    }
}

export default inject('apiStore')(inject('appStore')(observer(Settings)))