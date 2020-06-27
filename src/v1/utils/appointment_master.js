/**
 * Appointment Manager class.
 *
 * @constructor
 */
function AppointmentMaster() {
    this.MINUTES_IN_HOUR = 60;
}

AppointmentMaster.prototype.get_end_time = function(time) {

    // Scream at the developer who does not chech what data he/she sends to the function
    if(!(time instanceof Object)) throw new Error(`Time parameter has to have type Object, function received parameter of type ${typeof(time)}`);

    let endtime = {
        hour: time.start.hour      + Math.round(time.duration / this.MINUTES_IN_HOUR),
        minute: (time.start.minute + time.duration) % this.MINUTES_IN_HOUR,
    } 
    
    return endtime;
}

module.exports = AppointmentMaster;