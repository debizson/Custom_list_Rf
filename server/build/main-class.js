"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainClass = void 0;
const rxjs_1 = require("rxjs");
class MainClass {
    constructor() {
        this.availabilityThreshold = 30;
        console.log('Constructor called.');
    }
    // callback
    // Promise
    // Observable
    monitoringCallback(callback) {
        setTimeout(() => {
            const randAvailability = Math.random() * 100;
            if (randAvailability >= this.availabilityThreshold) {
                callback(null, 'Successful request, availability is: ' + randAvailability.toString() + '%');
            }
            else {
                callback('Error: availability is only ' + randAvailability.toString() + '%');
            }
        }, 3000);
    }
    monitoringPromise() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const randAvailability = Math.random() * 100;
                if (randAvailability >= this.availabilityThreshold) {
                    resolve('Successful request, availability is: ' + randAvailability.toString() + '%');
                }
                else {
                    reject('Error: availability is only ' + randAvailability.toString() + '%');
                }
            }, 3000);
        });
    }
    monitoringObservable() {
        return new rxjs_1.Observable((subscriber) => {
            let counter = 0;
            const interval = setInterval(() => {
                const randAvailability = Math.random() * 100;
                if (randAvailability >= this.availabilityThreshold) {
                    subscriber.next('Successful request, availability is: ' + randAvailability.toString() + '%');
                }
                else {
                    subscriber.error('Error: availability is only ' + randAvailability.toString() + '%');
                }
                counter++;
                if (counter === 5) {
                    clearInterval(interval);
                    subscriber.complete();
                }
            }, 2000);
        });
    }
}
exports.MainClass = MainClass;
