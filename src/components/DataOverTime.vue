<template>
  <div class="charts-container">
    <div id="efficacy-over-time" />
    <div id="symptomSeverity-over-time" />
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapGetters } from "vuex";
import { REPORTS } from "@/store/types";

export default {
  name: "DataOverTime",
  data() {
    return { paths: {} };
  },
  props: {
    patientId: Number,
  },
  watch: {
    patientId: function () {
      this.updateCharts();
    },
  },
  computed: {
    ...mapGetters({
      reportsByUser: REPORTS.GET_BY_USER,
    }),
  },
  mounted() {
    this.generateCharts();
  },
  methods: {
    generateCharts: function () {
      this.generateChart('efficacy', {min: -1, max: 1});
      this.generateChart('symptomSeverity', {min: 0, max: 2});
    },
    updateCharts: function () {
      this.updateChart('efficacy', {min: -1, max: 1});
      this.updateChart('symptomSeverity', {min: 0, max: 2});
    },
    generateChart: function (type, range) {
      // create data
      var data = this.reportsByUser[this.patientId];

      const margin = { top: 10, right: 40, bottom: 30, left: 30 };
      const width = 400 - margin.left - margin.right;
      const height = 250 - margin.top - margin.bottom;

      // prepare a helper function
      var lineFunc = d3
        .line()
        .x(function (d) {
          return x(d.daysOnTreatment);
        })
        .y(function (d) {
          return y(d[type]);
        });

      // create svg element:
      var svg = d3
        .select(`#${type}-over-time`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scaleLinear().domain([0, 100]).range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var y = d3.scaleLinear().domain([range.min, range.max]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Add the path using this helper function
      this.paths[type] = svg.append("path");

      this.paths[type]
        .attr("d", lineFunc(data))
        .attr("stroke", "black")
        .attr("fill", "none");
    },
    updateChart: function (type, range) {
      // create data
      var data = this.reportsByUser[this.patientId];

      const margin = { top: 10, right: 40, bottom: 30, left: 30 };
      const width = 400 - margin.left - margin.right;
      const height = 250 - margin.top - margin.bottom;
      var x = d3.scaleLinear().domain([0, 100]).range([0, width]);
      var y = d3.scaleLinear().domain([range.min, range.max]).range([height, 0]);

      // prepare a helper function
      var lineFunc = d3
        .line()
        .x(function (d) {
          return x(d.daysOnTreatment);
        })
        .y(function (d) {
          return y(d[type]);
        });

      this.paths[type]
        .attr("d", lineFunc(data))
        .attr("stroke", "black")
        .attr("fill", "none");
    },
  },
};
</script>

<style lang="scss">
.charts-container {
  height: 500px;
  width: 500px;
  border: 1px solid black;
}
</style>