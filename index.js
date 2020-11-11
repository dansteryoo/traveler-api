"use strict";

import { getProfiles } from "./api/profiles.service.js";
import { getAirlines } from "./api/airlines.service.js";
import { getTrips } from "./api/trip.service.js";

export async function getTravelersFlightInfo() {
  // ==================== fetch data
  const profiles = await getProfiles();
  const trips = await getTrips();
  const airlines = await getAirlines();

  // ==================== person information
  let personInfo = {};
  profiles.profiles.forEach((person) => {
    personInfo[person.personId] = {
      id: person.personId,
      name: person.name,
      flights: [],
      frequentFlyerNumber: person.rewardPrograms.air,
    };
  });

  // ==================== airline information
  let airlineList = {};
  airlines.airlines.forEach((airline) => {
    airlineList[airline.code] = airline.name;
  });

  // ==================== flight information

  function newLegData(leg, personId) {
    let newList = [];
    for (const each of leg) {
      const newLeg = {
        airlineCode: each.airlineCode,
        airlineName: airlineList[each.airlineCode],
        flightNumber: each.flightNumber,
        frequentFlyerNumber:
          personInfo[personId].frequentFlyerNumber[each.airlineCode] || "",
      };
      newList.push(newLeg);
    }
    return newList;
  }

  function findPersonFlights(personId) {
    let flightList = [];
    trips.trip.flights.forEach((flight) => {
      if (flight.travelerIds.includes(personId)) {
        const flightData = newLegData(flight.legs, personId);
        flightList.push({ legs: flightData });
      }
    });
    return flightList;
  }

  // ==================== travlers list
  let travelers = Object.values(personInfo).map((each) => {
    return {
      id: each.id,
      name: each.name,
      flights: findPersonFlights(each.id),
    };
  });

  // ==================== print data 
  // console.log({travelers})
  // travelers.forEach(each => {
  //   each.flights.forEach(flight => console.log(flight))
  // })
  
  return Promise.resolve({ travelers });
}

getTravelersFlightInfo();
