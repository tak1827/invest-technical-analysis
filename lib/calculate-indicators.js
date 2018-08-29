/**
 * Calculate indicators
 */

module.exports = {

    deviationRate : function(data, section, interval, term) {
        let _total = 0;
        let _mv_avrg = 0;
        let _dv_rate = 0;
        let _result = [];

        for (let i = 0; i < data.length; i++) {

            // Skip if already calculated
            if (typeof data[i]['dv_rate_' + section] !== 'undefined') continue;

            // Skip if interval data, pushing previous data
            if (i % interval != 0) {
                data[i]['dv_rate_' + section] = data[i-1]['dv_rate_' + section];
                data[i]['mv_avrg_' + section] = data[i-1]['mv_avrg_' + section];
                _result.push(data[i]);
                continue;
            }

            // Before the fist data
            if (i < term - 1) {
                _total = _total + data[i].p;
                data[i]['mv_avrg_' + section] = 0;
                data[i]['dv_rate_' + section] = 0;

            // First data
            } else if (i == term - 1) {

                // exponential moving average
                _total = _total + data[i].p;
                _mv_avrg = _total / term;
                data[i]['mv_avrg_' + section] = Math.round(_mv_avrg*100)/100; // Round off 3 decimal

                // moving average deviation rate
                _dv_rate = (data[i].p - data[i]['mv_avrg_' + section]) / data[i]['mv_avrg_' + section] * 100;
                data[i]['dv_rate_' + section] = Math.round(_dv_rate*100)/100; // Round off 3 decimal

            // The others
            } else {

                // exponential moving average
                let _n = term / interval;
                _mv_avrg = data[i-1]['mv_avrg_' + section] + (data[i].p - data[i-1]['mv_avrg_' + section]) * 2 / (_n+1);
                data[i]['mv_avrg_' + section] = Math.round(_mv_avrg*100)/100; // Round off 3 decimal

                // moving average deviation rate
                _dv_rate = (data[i].p - data[i]['mv_avrg_' + section]) / data[i]['mv_avrg_' + section] * 100;
                data[i]['dv_rate_' + section] = Math.round(_dv_rate*100)/100; // Round off 3 decimal
            }

            _result.push(data[i]);
        }

        return _result;
    },

    rsi : function(data, section, interval, term) {
        let _plusAve = 0;
        let _minuAve = 0;
        let _rsi = 0;
        let _result = [];

        // 計算
        for (let i = 0; i < data.length; i++) {

            // Skip if already calculated
            if (typeof data[i]['rsi_' + section] !== 'undefined') continue;

            // Skip i == 0
            if (i === 0) { 
                data[i]['rsi_' + section] = 0;
                _result.push(data[i]);
                continue; 
            }

            // Skip if interval data, pushing previous data
            if (i % interval != 0) { 
                data[i]['rsi_' + section] = data[i-1]['rsi_' + section]; 
                _result.push(data[i]);
                continue; 
            }

            // Before the fist data
            if (i < term) {

                // Up rather than previous data
                if (data[i].p >= data[i-1].p) _plusAve += data[i].p;

                // Down rather than previous data
                else _minuAve += data[i].p;

                // The fist data
                if (i == term - 1) {
                    _plusAve = _plusAve / (term / interval);
                    _minuAve = _minuAve / (term / interval);
                    _rsi = _plusAve / (_plusAve + _minuAve);
                    data[i]['rsi_' + section] = Math.round(_rsi*10000)/10000; // Round off 3 decimal
                
                // The others
                } else {
                    data[i]['rsi_' + section] = 0;
                }

            // The othres
            } else {

                // Up rather than previous data
                if (data[i].p >= data[i-1].p) {
                    _plusAve = (_plusAve * (term / interval - 1) + data[i].p) / (term / interval);
                    _minuAve = (_minuAve * (term / interval - 1)) / (term / interval);
                
                // Down rather than previous data
                } else {
                    _plusAve = (_plusAve * (term / interval - 1)) / (term / interval);
                    _minuAve = (_minuAve * (term / interval - 1) + data[i].p) / (term / interval);
                }

                _rsi = _plusAve / (_plusAve + _minuAve);
                data[i]['rsi_' + section] = Math.round(_rsi*10000)/10000; // Round off 3 decimal
            }

            _result.push(data[i]);
        }

        return _result;
    },

    bollBand : function(data, section, interval, term) {
        let _result = [];

        for (let i = 0; i < data.length; i++) {

            // Skip if already calculated
            if (typeof data[i]['bri_' + section] !== 'undefined') continue;

            // Skip if interval data, pushing previous data
            if (i % interval != 0) {
                data[i]['bri_' + section] = data[i-1]['bri_' + section];
                data[i]['sd_' + section] = data[i-1]['sd_' + section];
                _result.push(data[i]);
                continue;
            }

            // Skip if before the fist data
            if (i < term - 1) {
                data[i]['bri_' + section] = 0;
                data[i]['sd_' + section] = 0;
                _result.push(data[i]);
                continue;
            }

            // Skip if moving average don't exist
            if (typeof data[i]['mv_avrg_' + section] == 'undefined') { console.log('No MoveAvrg'); break; }


            // Calculate standard deviation
            let _uper = 0
            for (let j = 0; j < (term / interval); j++) _uper += Math.pow((data[i-j].p - data[i]['mv_avrg_' + section]), 2);
            _sd = Math.sqrt(_uper / (term / interval - 1));
            data[i]['sd_' + section] = Math.round(_sd*10000)/10000; // Round off 3 decimal
            
            // Calculate bollinger band
            if (data[i].p <= data[i]['mv_avrg_' + section] - _sd * 2) {
                data[i]['bri_' + section] = - 2;
            } else if (data[i].p <= data[i]['mv_avrg_' + section] - _sd && data[i].p > data[i]['mv_avrg_' + section] - _sd * 2) {
                data[i]['bri_' + section] = - 1;
            } else if (data[i].p <= data[i]['mv_avrg_' + section] + _sd && data[i].p > data[i]['mv_avrg_' + section] - _sd) {
                data[i]['bri_' + section] = 0;
            } else if (data[i].p <= data[i]['mv_avrg_' + section] + _sd * 2 && data[i].p > data[i]['mv_avrg_' + section] + _sd) {
                data[i]['bri_' + section] = + 1;
            } else if (data[i].p > data[i]['mv_avrg_' + section] + _sd * 2) {
                data[i]['bri_' + section] = + 2;
            }

            _result.push(data[i]);
        }

        return _result;
    },
}

