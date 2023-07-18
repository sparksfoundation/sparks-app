import { Button, Card, P } from "sparks-ui";
import DHT from '@hyperswarm/dht-relay';
import Stream from '@hyperswarm/dht-relay/ws';
import * as SDK from 'hyper-sdk';
import { Buffer } from 'buffer'
import util from "tweetnacl-util";
import React, { ReactPropTypes } from "react";

interface IProps { }

interface IState {
  peers: any[];
  sdk: any | null;
  waiting: boolean;
}

export class RelayService extends React.Component<IProps, IState>  {
  constructor(props: ReactPropTypes) {
    super(props);
    this.state = {
      peers: [],
      sdk: null,
      waiting: false,
    } as {
      peers: any[],
      sdk: any,
      waiting: boolean,
    };
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
  }

  async start() {
    this.setState({ waiting: true })
    const socket = new WebSocket(import.meta.env.SPARKS_WATCHER_RELAY)
    const dht = new DHT(new Stream(true, socket))

    console.log('creating sdk')
    const sdk = await SDK.create({
      storage: false,
      autoJoin: false,
      swarmOpts: {
        dht,
        maxPeers: 5,
      }
    }).catch((err: any) => {
      console.log(err)
    })

    const topic = Buffer.alloc(32).fill('trial')
    console.log('discovering getting topic')
    const discovery = await sdk.get(topic)
    discovery.on('peer-add', (peerInfo: any) => {
      const pub = util.encodeBase64(peerInfo.remotePublicKey)
      if (this.state.peers.includes(pub)) return
      this.setState({
        ...this.state,
        peers: [...this.state.peers, pub]
      })
    })

    discovery.on('peer-remove', (peerInfo: any) => {
      const pub = util.encodeBase64(peerInfo.remotePublicKey)
      if (!this.state.peers.includes(pub)) return
      this.setState({
        ...this.state,
        peers: [...this.state.peers.filter(p => p !== pub)]
      })
    })

    console.log('joining core')
    sdk.joinCore(discovery).then(() => {
      console.log('cooor')
      this.setState({
        ...this.state,
        waiting: false,
        sdk,
      })
    })
  }

  async stop() {
    this.setState({ ...this.state, waiting: true })
    await this.state.sdk.close()
    this.setState({ sdk: null, peers: [], waiting: false })
  }

  render() {
    return (
      <Card>
        {this.state.sdk ? (
          <Button onClick={this.stop} disabled={this.state.waiting}>{this.state.waiting ? 'please wait' : 'stop watching'}</Button>
        ) : (
          <Button onClick={this.start} disabled={this.state.waiting}>{this.state.waiting ? 'please wait' : 'start watching'}</Button>
        )}
        {this.state.sdk && this.state.peers.length === 0 ? (
          <P className="text-sm">waiting for peers</P>
        ) : this.state.sdk ? (
          <>
            <P className="text-sm">connected peers:</P>
            <P>
              {this.state.peers.map(id => <div key={id}>{id}</div>)}
            </P>
          </>
        ) : <P className="text-sm">not connected</P>}
      </Card>
    )
  }
}
