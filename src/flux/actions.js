import moment from 'moment';
import _ from 'lodash';
import firebaseApp from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const firebase = firebaseApp.initializeApp({
  apiKey: 'AIzaSyB_UMGTtBFm5peIvZr-67dbNBCoUs4tRbg',
  authDomain: 'eleven-6f723.firebaseapp.com',
  databaseURL: 'https://eleven-6f723.firebaseio.com',
  projectId: 'eleven-6f723',
  storageBucket: 'eleven-6f723.appspot.com',
  messagingSenderId: '772347263433'
});

export const constants = {
  SERVICES_LOADING: 'SERVICES_LOADING',
  SERVICES_LOADED: 'SERVICES_LOADED',
  SELECT_SERVICE: 'SELECT_SERVICE',
  SERVICES_FAILED: 'SERVICES_FAILED',
  MASTERS_LOADING: 'MASTERS_LOADING',
  MASTERS_LOADED: 'MASTERS_LOADED',
  MASTERS_FAILED: 'MASTERS_FAILED',
  SELECT_MASTER_NEXT_DATE: 'SELECT_MASTER_NEXT_DATE',

  BOOKING_SUBMIT: 'BOOKING_SUBMIT',
  BOOKING_SUBMITED: 'BOOKING_SUBMITED',
  BOOKING_FAILED: 'BOOKING_FAILED',
  BOOKING_CLEAR: 'BOOKING_CLEAR',
  SAVE_BOOKING_USER: 'SAVE_BOOKING_USER',
  BOOKING_DELETED: 'BOOKING_DELETED',
  BOOKING_DELETED_FAILED: 'BOOKING_DELETED_FAILED',
  BOOKING_DELETE_SERVICE: 'BOOKING_DELETE_SERVICE',

  MASTERS_TIME_LOADING: 'MASTERS_TIME_LOADING',
  MASTERS_TIME_LOADED: 'MASTERS_TIME_LOADED',
  MASTERS_TIME_ERROR: 'MASTERS_TIME_ERROR',
  
  ALL_EVENTS_LOADING: 'ALL_EVENTS_LOADING',
  ALL_EVENTS_LOADED: 'ALL_EVENTS_LOADED',
  ALL_EVENTS_FAILED: 'ALL_EVENTS_FAILED',

  AUTH_LOADING: 'AUTH_LOADING',
  AUTH_DONE: 'AUTH_DONE',
  AUTH_FAILED: 'AUTH_FAILED',
  LOGOUT: 'LOGOUT',

  SUB_SUCCESS: 'SUB_SUCCESS',
  SUB_FAILED: 'SUB_FAILED',
  SUB_START: 'SUB_START',
};

export function loadServices() {
  return dispatch => {
    dispatch({
      type: constants.SERVICES_LOADING
    });
    firebase.database().ref('lviv/services/2/sub').set([ {
  "duration" : 2,
  "id" : "s3_8",
  "name" : "all inclusive (зняття + чистка + покриття)"
}, {
  "duration" : 1,
  "id" : "s3_1",
  "name" : "класичний без покриття"
}, {
  "duration" : 1,
  "id" : "s3_2",
  "name" : "покриття гель лак"
}, {
  "duration" : 0.5,
  "id" : "s3_3",
  "name" : "покриття лак"
}, {
  "duration" : 0.5,
  "id" : "s3_4",
  "name" : "зняття гель лак"
}, {
  "duration" : 1,
  "id" : "s3_5",
  "name" : "чоловічий манікюр"
}, {
  "duration" : 0.5,
  "id" : "s3_6",
  "name" : "дитячий манікюр"
}, {
  "duration" : 2,
  "id" : "s3_7",
  "name" : "педикюр"
} ])
.then(() => console.log('done'))
.catch((e) => console.error(e));
    firebase.database().ref('lviv/services').once('value')
      .then((services) => {
        console.log('services loaded', services.val());
        dispatch({
          type: constants.SERVICES_LOADED,
          data: services.val()
        });
      })
      .catch((error) => {
        console.error('action loadServices failed', error);
        dispatch({
          type: constants.SERVICES_FAILED,
          error: error
        });
      });
  };
}

export function selectService(data) {
  return {
    type: constants.SELECT_SERVICE,
    data
  };
}

export function selectMasterNextDate(data) {
  return {
    type: constants.SELECT_MASTER_NEXT_DATE,
    data
  };
}

export function loadMasters() {
  return dispatch => {
    dispatch({
      type: constants.MASTERS_LOADING
    });
    firebase.database()
      .ref('lviv/masters')
      .once('value')
      .then((masters) => {
        const mastersList = masters.val();
        console.log('masters loaded', mastersList);
        dispatch({
          type: constants.MASTERS_LOADED,
          data: mastersList
        });
      })
      .catch((error) => {
        console.error('action loadMasters failed', error);
        dispatch({
          type: constants.MASTERS_FAILED,
          error: error
        });
      });
  };
}

export function getMastersTime(mastersList, _date_) {
  return dispatch => {
    dispatch({
      type: constants.MASTERS_TIME_LOADING
    });
    const date = moment(_date_);
    if (mastersList) {
      return Promise.all(
        mastersList.map((master) => firebase.database()
          .ref(`lviv/mastersTime/${master.id}/${date.get('year')}/${date.get('month')}/${date.get('date')}`).once('value'))
      )
      .then((timeList) => timeList.map((time) => time.val()))
      .then((result) => {
        dispatch({
          type: constants.MASTERS_TIME_LOADED,
          data: {mastersList, result, date}
        });
      })
      .catch((e) => {
        dispatch({
          type: constants.MASTERS_TIME_ERROR,
          error: e
        });
      });
    }
  };
}

export function getAllEvents() {
  return dispatch => {
    const date = moment().subtract(1, 'month');
    dispatch({
      type: constants.ALL_EVENTS_LOADING
    });

    Promise.all([
      loadMastersRequest(),
      loadBookingsRequest(date),
    ])
    .then(([masters, bookings]) => {
      dispatch({
        type: constants.MASTERS_LOADED,
        data: masters.val()
      });
      dispatch({
        type: constants.ALL_EVENTS_LOADED,
        data: bookings.val()
      });
    })
    .catch((error) => {
      console.error('action getAllEvents failed', error);
      dispatch({
        type: constants.ALL_EVENTS_FAILED,
        error: error
      });
    });
  };
}

function loadMastersRequest() {
  return firebase.database()
    .ref('lviv/masters')
    .once('value');
}

function loadBookingsRequest(date) {
  return firebase.database()
    .ref('lviv/bookings')
    .orderByChild('timestamp')
    .startAt(date.toDate().getTime())
    .once('value');
}

export function submitBooking(booking) {
  return dispatch => {
    booking.timestamp = moment().toDate().getTime();
    dispatch({
      type: constants.BOOKING_SUBMIT,
      data: {booking}
    });
    const mastersData = getMasterTime(booking.selectedServices);
    Promise.all([
      firebase.database().ref('lviv/mastersTime')
        .update(mastersData),
      firebase.database().ref('lviv/bookings')
        .push(booking)
    ])
      .then(() => {
        console.log('submitBooking done');
        dispatch({
          type: constants.BOOKING_SUBMITED
        });
      })
      .catch((error) => {
        console.error('action submitBooking failed', error);
        dispatch({
          type: constants.BOOKING_FAILED,
          error: error
        });
      });
  };
}

export function saveBookingUser(data) {
  return {
    type: constants.SAVE_BOOKING_USER,
    data
  };
}

export function clearBooking() {
  return {
    type: constants.BOOKING_CLEAR,
  };
}

export function deleteBoking(bookingId) {
  return dispatch => {
    firebase.database()
    .ref('lviv/bookings/' + bookingId)
    .once('value')
    .then((_booking) => {
      let booking = _booking.val();
      const mastersData = getMasterTime(booking.selectedServices);

      booking.status = 'deleted';
      return Promise.all([
        _.keys(mastersData).map((key) => firebase.database().ref('lviv/mastersTime/' + key).remove()),
        firebase.database().ref('lviv/bookings/' + bookingId)
          .update(booking)
      ]);
    })
    .then(() => {
      dispatch({
        type: constants.BOOKING_DELETED,
        data: {bookingId}
      });
    })
    .catch((error) => {
      dispatch({
        type: constants.BOOKING_DELETED_FAILED,
        data: {error}
      });
    });
    
  };
}

export function authenticate(email, password) {
  return dispatch => {
    dispatch({
      type: constants.AUTH_LOADING,
    });
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        dispatch({
          type: constants.AUTH_DONE,
          data: {email}
        });
      })
      .catch((error) => {
        dispatch({
          type: constants.AUTH_FAILED,
          error
        });
      });
  };
}

export function logout() {
  return dispatch => {
    firebase.auth().signOut()
    .then(() => {
      dispatch({
        type: constants.LOGOUT
      });
    });
  };
}

export function subscribe(email) {
  return dispatch => {
    dispatch({
      type: constants.SUB_START
    });
    firebase.database().ref('lviv/subscriptions')
      .push({
        date: moment().toDate().getTime(),
        email
      })
      .then(() => dispatch({type: constants.SUB_SUCCESS}))
      .catch((error) => dispatch({type: constants.SUB_FAILED, data: {error}}));
  }
}

export function deleteSelectedService(serviceId) {
  return {
    type: constants.BOOKING_DELETE_SERVICE,
    data: {serviceId}
  }
}

function getMasterTime(bookings) {
  return _.reduce(bookings, (result, booking) => {
    let date = moment(booking.dateStart);
    result[`${booking.masterId}/${date.get('year')}/${date.get('month')}/${date.get('date')}/${date.get('hour')}/${date.get('minute')}`] = {name: booking.name, duration: booking.duration};
    return result;
  }, {});
}
