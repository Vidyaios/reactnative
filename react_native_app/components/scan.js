import React, {Component} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Home from './Home';
import BleManager from 'react-native-ble-manager';
import {stringToBytes} from 'convert-string';

class Scan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scan: false,
      ScanResult: false,
      result: null,
    };
  }

  onSuccess = e => {
    const check = e.data.substring(0, 20);
    console.log('scanned data' + check);
    console.log('connnected peripheral ' + this.retrieveDevice());
    this.setState({
      result: e,
      scan: false,
      ScanResult: true,
    });
    if (check === 'http') {
      Linking.openURL(e.data).catch(err =>
        console.error('An error occured', err),
      );
    } else {
      this.setState({
        result: e.data.substring(0, 20),
        scan: false,
        ScanResult: true,
      });
    }
  };

  retrieveDevice = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      let buffer = new ArrayBuffer(32);
      var today = Math.round(Date.now() / 1000); //Math.round(new Date().getTime() / 1000);
      console.log('current time ' + today);
      // console.log('current time ' + today.getBytes(Charsets.UTF_8));
      // console.log('current time ' + stringToBytes(today));

      // let time = Math.round(Date.now() / 1000);
      // let seconds = parseInt(time / 1000);
      // let data = new Buffer(4);
      // data.writeUInt32BE(seconds);
      // console.log('current time buffer' + today);

      var lat = 45.49948 * 1000000;
      console.log('latitude ' + lat);
      //console.log('latitude ' + stringToBytes(lat));
      var long = -73.67725 * 1000000;
      console.log('longitude' + long);
      //console.log('latitude ' + stringToBytes(long));

      if (results.length == 0) {
        console.log('No connected peripherals');
        this.alertMessage();
      } else {
        console.log(results);
        for (var i = 0; i < results.length; i++) {
          var peripheral = results[i];
          console.log(peripheral);

          // Prepare data
          // var today = Date.now() / 1000; //Math.round(new Date().getTime() / 1000);
          // console.log('current time ' + today);
          // // byte[] timeArray = this.convertStringToByteArray(swapIntHostToBig(today));
          // console.log(
          //   'current time byte array ' +
          //     this.convertStringToByteArray(swapIntHostToBig(today)),
          // );

          // var lat = 45.49948 * 1000000;
          // console.log('latitude ' + lat);
          // var long = -73.67725 * 1000000;
          // console.log('longitude' + long);
          let data = [
            96, -54, 104, 103, 2, -74, 68, -51, -5, -101, -58, 26, 68, 71, 32,
            80, 77, 32, 35, 49, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32,
          ];
          BleManager.write(
            peripheral.id,
            peripheral.serviceUUIDs,
            peripheral.serviceUUIDs,
            data,
            32,
          )
            .then(results => {
              console.log('writing...');
              setIsScanning(true);
            })
            .catch(err => {
              console.error(err);
            });
        }
      }
    });
  };

  convertStringToByteArray(str) {
    String.prototype.encodeHex = function () {
      var bytes = [];
      for (var i = 0; i < str.length; ++i) {
        bytes.push(this.charCodeAt(i));
      }
      console.log('byte array ' + byte);
      return bytes;
    };
    var byteArray = str.encodeHex();
    console.log('byte array 1 ' + byteArray);
    return byteArray;
  }

  alertMessage = () =>
    Alert.alert('Warning', 'Please connect to the BLE device and scan again!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);

  scanAgain = () => {
    this.scanner.reactivate();
    this.setState({
      scan: true,
      ScanResult: false,
    });
  };
  render() {
    return (
      <QRCodeScanner
        showMarker={true}
        ref={node => {
          this.scanner = node;
        }}
        onRead={this.onSuccess}
        containerStyle={{height: 300}}
        cameraStyle={{
          height: 250,
          width: 400,
          marginTop: 60,
          alignSelf: 'center',
          justifyContent: 'center',
        }}
        topContent={
          <TouchableOpacity
            onPress={this.scanAgain}
            style={styles.buttonTouchable}>
            <Text style={styles.buttonTextStyle}>
              Click to Scan again! {'\n'}
              {this.state.result}
            </Text>
          </TouchableOpacity>
          // <Text style={styles.centerText}>
          //   Scan QR code{"\n"}
          //   {this.state.result}
          // </Text>
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#000',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default Scan;
