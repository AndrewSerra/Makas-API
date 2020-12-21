/**
 * Appointment Manager class.
 *
 * @constructor
 */
function AppointmentMaster() {}

AppointmentMaster.prototype.MINUTES_IN_HOUR = 60;
AppointmentMaster.prototype.status_types = [
    "pending",
    "accepted",
    "cancelled",
    "complete"
]

AppointmentMaster.prototype.format_start_date = function(time) {
    // Scream at the developer who does not chech what data he/she sends to the function
    if(!(time instanceof Object)) throw new Error(`Time parameter has to have type Object, function received parameter of type ${typeof(time)}`);

    const date = new Date(time.date);
    const minutes_to_add = (this.MINUTES_IN_HOUR * Number(time.start.hour)) + Number(time.start.minute)
    date.setMinutes(date.getMinutes() + minutes_to_add);

    return date;
}

AppointmentMaster.prototype.get_end_time = function(time, start_date) {

    // Scream at the developer who does not chech what data he/she sends to the function
    if(!(time instanceof Object)) throw new Error(`Time parameter has to have type Object, function received parameter of type ${typeof(time)}`);
    
    const end_date = new Date(start_date);
    end_date.setMinutes(end_date.getMinutes() + time.duration);
    
    return end_date;
}

AppointmentMaster.prototype.is_status_valid = function(status) {
    return this.status_types.includes(status);
}

module.exports = AppointmentMaster;