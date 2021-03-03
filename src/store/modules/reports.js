import { REPORTS } from "../types";
import _ from "lodash";

function range(start, end, step = 1) {
  var _end = end || start;
  var _start = end ? start : 0;
  var _step = step || 1;
  return Array((_end - _start) / _step)
    .fill(0)
    .map((v, i) => _start + i * _step);
}

const state = {
  reports: [],
  lengthOfTrial: 0,
};

const getters = {
  [REPORTS.GET_BY_DATE](state, getters) {
    const reports = [...state.reports];
    const dates = _.groupBy(reports, (report) => report.daysOnTreatment);
    const days = range(0, getters[REPORTS.LENGTH_OF_TRIAL]);
    const patients = getters[REPORTS.GET_PATIENTS];

    const reportsByDate = [];
    days.forEach((day) => {
      const date = dates[day] || [];
      patients.forEach((patientID) => {
        if (day > 0 && !date.find((_patient) => _patient.id === patientID)) {
          const _date = reportsByDate[day - 1][patientID];
          date.push({..._date, daysOnTreatment: day});
        }
      });

      reportsByDate.push(date);
    });

    return reportsByDate;
  },
  [REPORTS.DIAGNOSES](state) {
    const diags = state.reports.map((report) => report.diagnosis);

    return Array.from(new Set(diags));
  },
  [REPORTS.TREATMENTS](state) {
    const treatments = state.reports.map((report) => report.treatment);

    return Array.from(new Set(treatments));
  },
  [REPORTS.GET_BY_USER](state) {
    const reports = [...state.reports];

    return _.groupBy(reports, (report) => report.id);
  },
  [REPORTS.LENGTH_OF_TRIAL](state) {
    let lengthOfTrial = 0;

    state.reports.forEach((report) => {
      if (report.daysOnTreatment > lengthOfTrial) {
        lengthOfTrial = report.daysOnTreatment;
      }
    });

    return lengthOfTrial;
  },
  [REPORTS.GET_PATIENTS](state) {
    const reports = [...state.reports];

    return Array.from(new Set( reports.map((report) => report.id)))
  },
};

const mutations = {
  [REPORTS.SET](state, { userData }) {
    const keys = userData.shift();

    const reports = userData.map((_report) => {
      const report = {};
      keys.forEach((key, i) => {
        report[key] = _report[i];
      });
      return report;
    });

    state.reports = reports;
  },
  [REPORTS.SET_REPORTS](state, { reports }) {
    state.reports = reports;
  },
};

const actions = {
  [REPORTS.SET]({ commit }, { userData }) {
    commit(REPORTS.SET, { userData });
  },
  [REPORTS.SET_REPORTS]({ commit }, { reports }) {
    commit(REPORTS.SET_REPORTS, { reports });
  },
};

export default { state, getters, mutations, actions };
