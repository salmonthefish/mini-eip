(function(undefined) {

    Date.prototype.getNumberOfDaysInMonth = function() {
        var date = this.getDate();
        var month = this.getMonth();
        var isLeapYear = this.isLeapYear();
        var numberOfDaysInMonthArray = [31, (isLeapYear ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        return numberOfDaysInMonthArray[month];
    };

    Date.prototype.isLastDateOfMonth = function() {
        return(this.getDate() === this.getNumberOfDaysInMonth());
    };

    Date.prototype.isLeapYear = function() {
        return(this.getFullYear() % 4 === 0);
    };

    Date.prototype.addDates = function(numberOfDates) {
        this.setDate(this.getDate() + numberOfDates);
        return this;
    };

    Date.prototype.addMonths = function(numberOfMonths) {
        var currentDate = this.getDate();
        var isCurrentDateLastDateOfMonth = this.isLastDateOfMonth();

        this.setDate(1);
        this.setMonth(this.getMonth() + numberOfMonths);

        if(!isCurrentDateLastDateOfMonth) {
            if(currentDate > 28) {
                this.setDate(Math.min(currentDate, this.getNumberOfDaysInMonth()));
            } else {
                this.setDate(currentDate);
            }
        } else {
            this.setDate(this.getNumberOfDaysInMonth());
        }

        return this;
    };

    Date.prototype.addYears = function(numberOfYears) {
        var currentDate = this.getDate();
        var isCurrentDateLastDateOfMonth = this.isLastDateOfMonth();

        this.setDate(1);
        this.setFullYear(this.getFullYear() + numberOfYears);

        if(!isCurrentDateLastDateOfMonth) {
            if(currentDate > 28) {
                this.setDate(Math.min(currentDate, this.getNumberOfDaysInMonth()));
            } else {
                this.setDate(currentDate);
            }
        } else {
            this.setDate(this.getNumberOfDaysInMonth());
        }

        return this;
    };

    Date.prototype.toMMDDYYYY = function() {
        var date = this.getDate();
        var month = this.getMonth() + 1;
        var year = this.getFullYear();
        return (month < 10 ? '0' + month : month) + '/' + (date < 10 ? '0' + date : date) + '/' + year;
    };

    Date.prototype.toAuctionTimeFormat = function() {
        var month = this.getUTCMonth() + 1;
        var day = this.getUTCDate();

        var hour = this.getUTCHours();

        var meridiem = 'AM';
        if(hour > 12) {
            hour -= 12;
            meridiem = 'PM';
        }else if(hour == 12) {
            meridiem = 'PM';
        }

        var minute = this.getUTCMinutes();
        if(minute < 10) {
            minute = '0' + minute;
        }

        var second = this.getUTCSeconds();
        if(second < 10) {
            second = '0' + second;
        }

        return month + '/' + day + ' ' + hour + ':' + minute + ':' + second + ' ' + meridiem;
    };

    Date.prototype.toCountdown = function() {
        var time = Math.round(this.getTime() / 1000);

        var days = Math.floor(time / (24 * 60 * 60));

        var divisor_for_hours = time % (24 * 60 * 60);
        var hours = Math.floor(divisor_for_hours / (60 * 60));

        var divisor_for_minutes = divisor_for_hours % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);

        return days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds';
    };

})();