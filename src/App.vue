<template>
  <div class="app-view">
    <div class="charts">
      <div id="chart" />
      <data-over-time v-if="selectedPatient" :patient-id="selectedPatient"/>
    </div>
    <div>
      <div id="data-viz" v-if="state !== 'init'">
        <button
          @click="playPause"
          id="play-button"
          v-text="buttonTitle"
        ></button>
        <input
          type="range"
          id="days"
          name="days"
          min="0"
          :max="lengthOfTrial"
          step="1"
          v-model="day"
          @input="updateChart()"
        />
        <label for="days">Days on Trial {{ day }}</label>
        <div class="options-container">
          <span class="selectors-container">
            <h3>Diagnosis</h3>
            <div v-for="diagnosis in diagnoses" :key="diagnosis">
              <input
                type="checkbox"
                :id="diagnosis"
                :value="diagnosis"
                v-model="selectedDiagnoses"
                @change="updateChart"
              />
              <label :for="diagnosis" v-text="diagnosis"></label>
            </div>
          </span>
          <span class="selectors-container">
            <h3>Treatment</h3>
            <div v-for="treatment in treatments" :key="treatment">
              <input
                type="checkbox"
                :id="treatment"
                :value="treatment"
                v-model="selectedTreatments"
                @change="updateChart"
              />
              <label :for="treatment" v-text="treatment"></label>
            </div>
          </span>
        </div>
      </div>
      <input v-else type="file" @change="loadUsers" accept="csv" />
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapActions, mapGetters } from "vuex";
import { REPORTS } from "@/store/types";
import DataOverTime from "@/components/DataOverTime";

export default {
  name: "App",
  mounted() {
    if (process.env.VUE_APP_MODE === "TEST") {
      this.state = "paused";
      const reports = require("./assets/testData.json");

      this.setReports({ reports });
      this.generateChart();
    }
  },
  components: {
    DataOverTime,
  },
  data() {
    return {
      day: 0,
      state: "init",
      intervalID: undefined,
      selectedDiagnoses: [],
      selectedTreatments: [],
      selectedPatient: undefined,
    };
  },
  computed: {
    _day: function () {
      return this.day;
    },
    buttonTitle: function () {
      if (this.state === "running") {
        return "Pause";
      } else {
        return "Play";
      }
    },
    ...mapGetters({
      chartData: REPORTS.GET_BY_DATE,
      diagnoses: REPORTS.DIAGNOSES,
      treatments: REPORTS.TREATMENTS,
      lengthOfTrial: REPORTS.LENGTH_OF_TRIAL,
    }),
  },
  methods: {
    targetPatient: function (patient) {
      if (
        this.selectedDiagnoses.length > 0 &&
        !this.selectedDiagnoses.includes(patient.diagnosis)
      ) {
        return false;
      }
      if (
        this.selectedTreatments.length > 0 &&
        !this.selectedTreatments.includes(patient.treatment)
      ) {
        return false;
      }
      return true;
    },
    playPause: function () {
      if (this.state === "running") {
        this.pause();
      } else {
        this.play();
      }
    },
    pause: function () {
      if (this.intervalID) {
        window.clearInterval(this.intervalID);
      }
      this.state = "notRunning";
    },
    play: function () {
      if (this.day === this.lengthOfTrial) {
        this.day = -1;
      }
      this.state = "running";
      this.day++;
      this.updateChart();
      const _intervalID = setInterval(() => {
        if (this.day === this.lengthOfTrial) {
          this.state = "notRunning";
          window.clearInterval(_intervalID);
          return;
        } else {
          this.day++;
          this.updateChart();
        }
      }, 500);
      this.intervalID = _intervalID;
    },
    generateChart: function () {
      const temp = this.chartData[0];

      const margin = { top: 10, right: 40, bottom: 30, left: 30 };
      const width = 498 - margin.left - margin.right;
      const height = 496 - margin.top - margin.bottom;

      const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scaleLinear().domain([-1, 1]).range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var y = d3.scaleLinear().domain([0, 2]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // const color = d3.scaleOrdinal(d3.schemeDark2);

      svg
        .selectAll("patients")
        .data(temp)
        .enter()
        .append("circle")
        .attr("class", "circleBasicTooltip")
        .attr("cx", function (d) {
          return x(d.efficacy);
        })
        .attr("cy", function (d) {
          return y(d.symptomSeverity);
        })
        .attr("r", 7)
        .on("mouseover", function (e, d) {
          d3.select(this).attr("fill", "red");
          return tooltip.style("visibility", "visible").html(
            `<p>Toxicity: ${d.symptomSeverity}</p>
            <p>Efficacy: ${d.efficacy}</p>`
          );
        })
        .on("mousemove", function () {
          return tooltip
            .style("top", event.pageY - 50 + "px")
            .style("left", event.pageX + 25 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("fill", "black");
          return tooltip.style("visibility", "hidden");
        })
        .on("click", (e, d) => {
          this.selectedPatient = d.id;
        });

      var tooltip = d3
        .select("#chart")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");
    },
    updateChart: function () {
      const margin = { top: 10, right: 40, bottom: 30, left: 30 };
      const width = 500 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      var x = d3.scaleLinear().domain([-1, 1]).range([0, width]);

      var y = d3.scaleLinear().domain([0, 2]).range([height, 0]);

      const dayData = this.chartData[this._day - 1];
      d3.selectAll("circle").classed("no-disp", true);

      d3.selectAll("circle")
        .filter((d) => {
          return this.targetPatient(d);
        })
        .classed("no-disp", false);

      d3.selectAll("circle")
        .data(dayData)
        // .transition()
        // .duration(500)
        .attr("cx", function (d) {
          return x(d.efficacy);
        })
        .attr("cy", function (d) {
          return y(d.symptomSeverity);
        });
    },
    loadUsers: function (event) {
      // debugger
      this.$papa.parse(event.target.files[0], {
        skipEmptyLines: true,
        complete: (results) => {
          this.setUsers({ userData: results.data });
          if (this.state === "init") {
            this.generateChart();
          } else {
            this.updateChart();
          }
          this.state = "paused";
        },
      });
    },
    ...mapActions({
      setUsers: REPORTS.SET,
      setReports: REPORTS.SET_REPORTS,
    }),
  },
};
</script>

<style lang="scss">
.app-view {
  .charts {
    display: flex;
    #chart {
      border: 1px solid black;
    }
    .no-disp {
      display: none;
    }
  }
  #play-button {
    width: 60px;
  }

  .options-container {
    display: flex;

    .selectors-container {
      margin-right: 8px;
    }
  }
}
</style>