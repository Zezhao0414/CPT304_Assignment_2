<template>
  <div class="block">
  <span class="demonstration"  v-loading="countryLoading" >Country selction</span> 
  <el-cascader size = 'medium' placeholder="Select a country"
    v-model="value"
    :options="countryOptions"
    @change="handleChange">
  </el-cascader>

  <div id="holidays"> 
    <span v-show="hasNoHolidays"><i class="el-icon-warning"></i> No holiday is find in {{value}}, maybe change another country?</span>
    <div v-show="hasNoHolidays == false && ifshowtable1">
      <span >{{sentence1}}{{country}}{{sentence2}}</span>
    <el-table v-loading="loading1"
      :data="validHolidaysApi"
      style="width: 100%">
      <el-table-column
        prop="name"
        label="Holiday name"
        width="180">
      </el-table-column>
      <el-table-column
        prop="date"
        label="date"
        width="180">
      </el-table-column>
      <el-table-column
        prop="day"
        label="day"
        width="180">
      </el-table-column>
    </el-table>
    </div>
  </div>
  
  <div id="city" v-show="ifshowtable1 && loading1 == false">
    <span >Which city do you want to go in {{value}}? </span>
    <el-select v-model="city" placeholder="Please select a city: ">
    <el-option v-loading="loading1"
      v-for="item in cityapi"
      :key="item.name"
      :label="item.name"
      :value="item.name"
      @click.native="getHotel">
    </el-option>
  </el-select>
  </div>
  
  <div id="hotel" v-show="ifshowtable1 && loading1 == false && ifHotelTableShows">
    <span >Here are the hotels in {{city}}: </span>
    <el-table v-loading = "hotelsLoading"
      :data="hotelApi"
      style="width: 100%">
      <el-table-column
        prop="name"
        label="Hotel name"
        width="180">
      </el-table-column>
      <el-table-column
        prop="latitude"
        label="latitude"
        width="180">
      </el-table-column>
      <el-table-column
        prop="longitude"
        label="longitude"
        width="180">
      </el-table-column>
    </el-table>
  </div>

  <div v-show="ifshowtable1 && loading1 == false && ifHotelTableShows" id="calender">
    <span >According to the date of the holiday, please select the data that you want to start your journey: </span>
    <el-date-picker
      v-model="startDate"
      type="date"
      placeholder="Date selection"
      :picker-options="pickerOptions"
      @change="validWeatherTime">
    </el-date-picker>
  </div>

  <div id="weather" v-show="ifshowtable1 && loading1 == false && ifHotelTableShows && weatherShow">
    <span >Here is the weather forecast of {{city}} after {{startDate}} (Only weather forecast for the next 14 days):</span>
    <el-table v-loading = 'weatherLoading'
      :data="weatherValid"
      style="width: 100%">
      <el-table-column
        prop="validTime"
        label="Date"
        width="180">
      </el-table-column>
      <el-table-column
        prop="maxTempC"
        label="Maximum temperature"
        width="200">
      </el-table-column>
      <el-table-column
        prop="minTempC"
        label="Minimum temperature"
        width="200">
      </el-table-column>
    </el-table>
  </div>

  </div>
</template>

<script>
import axios from "axios"
  export default {
    mounted(){
      var that = this;
      var axios = require('axios');
      var config = {
        method: 'get',
        url: ' https://restcountries.com/v3.1/all',
      };
      axios(config).then(function (response) {
        that.dataapi = response.data;
        for(var i = 0; i < that.dataapi.length; i++){
          that.countryOptions.push({value:that.dataapi[i].name.common, label: that.dataapi[i].name.common})
          
          //that.countryOptions.push({value:that.dataapi[i].name, label: that.dataapi[i].name})
        }
        that.countryLoading = false;
        //console.log(JSON.stringify(response.data));
        //console.log(that.countryOptions);
      }).catch(function (error) {
        console.log(error);
        that.networkError();
      });
    },
    data() {
      return {
        countryLoading: true, //if the country list is loading 
        dataapi:[],  // store the data from country API
        value: '',   // The value of the selected country
        countryOptions:[], // All selectable countries data
        holidaysApi:[], // The data of all holidays
        validHolidaysApi:[], // Festivals later than today 
        noHolidays:"Sorry, no holidays information now!", 
        iso: '', // Abbreviation of the selected country
        hasNoHolidays: false, // if there is no holiday in this country 
     
        ifshowtable1: false, // if the table of holidays should be shown
        cityapi: [], // cities data
        
       
        city:"", // city name 
        loading1: false, // if city list is loading 
        startDate: "", // the date picked 
        hotelApi:[], // hotels information
  
        ifHotelTableShows: false, // if the table of hotels shows
        weatherApi:[],  // future weather info
        weatherValid:[], // the weather info after the data picked  
       
        weatherLoading: false, //if weather list is loading
        hotelsLoading: false, //id hotel list is loading
        weatherShow: false, // if weather is loading

        pickerOptions: {
          disabledDate(time) {
            return time.getTime() <= Date.now();
          },
        }
      };
    },
    methods: {
      handleChange(value) {
        this.resetCountry();
        //ninjas
        for(var i = 0; i < this.dataapi.length; i++){
          if(value==this.dataapi[i].name.common){
            this.iso = this.dataapi[i].cca2;
          }
        }

        var that = this;
        var year = '2023'
        var config1 = {
          method: 'get',
          url: 'https://api.api-ninjas.com/v1/holidays?country=' + this.iso + '&year=' + year + "&type=public_holiday",
          headers:{
            'X-Api-Key': 'VkCU8fK/QhnouAe1WLzNuw==LXeHxjKDvRa5uD1Y'
          }
        };
        axios(config1).then(function (response) {
          that.holidaysApi = response.data;
          if(response.data.length==0){
            console.log(JSON.stringify(response.data))
            that.noHolidays = "";
            that.hasNoHolidays = true;
            that.loading1 = false;
          }
          else{;
            that.hasNoHolidays = false;
            that.timeJudge(that.holidaysApi);
          }
          //console.log(response.data);
        }).catch(function (error) {
          console.log(error);
          that.networkError();
        });


        var config2 = {
          method: 'get',
          url: 'https://api.api-ninjas.com/v1/city?country=' + this.iso,
          headers:{
            'X-Api-Key': 'VkCU8fK/QhnouAe1WLzNuw==LXeHxjKDvRa5uD1Y'
          }
        };
        axios(config2).then(function (response) {
          that.cityapi = response.data;
          //console.log(response.data);
        }).catch(function (error) {
          console.log(error);
          that.networkError();
        });
      },
      timeJudge(holidayList){
        var d = new Date();
        //console.log("d gettime: " + d.getTime());
        for(var i=0; i<this.holidaysApi.length; i++){
          var holiDate = new Date(this.holidaysApi[i].date);
          if(holiDate.getTime() > d.getTime()){
            this.validHolidaysApi.push(this.holidaysApi[i])
          }
        }
        this.loading1 = false;
      },
      getHotel(){
        this.hotelsLoading = true;
        this.ifHotelTableShows = true;
        var that = this;
        //console.log("Getting hotel information");
        const config3 = {
          method: 'GET',
          "url": "https://hotels4.p.rapidapi.com/locations/search?query=" + this.city + "&locale=en_US",
          headers: {
            "x-rapidapi-key": "fa41453f69mshd35d3154a35775ep1adb88jsna2bf7401a6ae",
			      "x-rapidapi-host": "hotels4.p.rapidapi.com"
          }
        };
        axios(config3).then(function (response) {
          that.hotelApi = response.data.suggestions[1].entities; //get hotel array
          if(that.hotelApi != null){
            that.hotelsLoading = false;
            that.getWeather();
          }
          else{

          }
          //console.log(that.hotelApi);
        }).catch(function (error) {
          console.log(error);
          that.networkError();
        });
      },
      getWeather(){
        var that = this;
        const config4 = {
          method: 'GET',
          "url": "https://aerisweather1.p.rapidapi.com/forecasts/"+ this.city +","+ this.iso + "?plimit=24",
          headers: {
            "x-rapidapi-key": "84b4e004d4msh6eabc7a0120cf44p1d9ce3jsn5502a62f81e9",
            "x-rapidapi-host": "aerisweather1.p.rapidapi.com"
          }
        };
        axios(config4).then(function (response) {
          that.weatherApi = response.data.response[0].periods;
        }).catch(function (error) {
          console.log(error);
          that.networkError();
        });
      },
      validWeatherTime(){
        this.weatherValid = [];
        this.weatherLoading = true;
        console.log("Finding weather info");
        //console.log(this.weatherApi);
        for(var i = 0; i < this.weatherApi.length; i++){
          var weatherTime =  new Date(this.weatherApi[i].validTime.substring(0, 10));
          var startTime = new Date(this.startDate);
          if((startTime - weatherTime) < 0){
            this.weatherValid.push(this.weatherApi[i]);
          }
        }
        this.weatherShow = true;
        this.weatherLoading = false;
      },
      resetCountry(){
        this.holidaysApi=[], // The data of all holidays
        this.validHolidaysApi=[], // Festivals later than today 
        this.iso= '', // Abbreviation of the selected country
        this.hasNoHolidays = false, // if there is no holiday in this country 
        this.ifshowtable1= true, // if the table of holidays should be shown
        this.cityapi= [], // cities data
        this.city="", // city name 
        this.loading1= true, // if city list is loading 
        this.startDate= "", // the date picked 
        this.hotelApi=[], // hotels information
        this.ifHotelTableShows= false, // if the table of hotels shows
        this.weatherApi=[],  // future weather info
        this.weatherValid=[], // the weather info after the data picked  
        this.weatherLoading= false, //if weather list is loading
        this.hotelsLoading= false, //id hotel list is loading
        this.weatherShow= false // if weather is loading
      },
      networkError(){
        this.$message({
          message: 'Network error',
          type: 'warning'
        });
      }
    }
  };
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
