export class Colors {
    color(color) {
        return this[color];
    }
    available() {
        return ['black', 'darkBlue', 'blue', 'red', 'yellow'];
    }
    all(type?) {
        if (!type) {
            let type = 'default';
        }
        switch (type) {
            case 100:
                return [
                    this.black(100),
                    this.darkBlue(100),
                    this.blue(100),
                    this.red(100),
                    this.yellow(100)
                ];
            case 75:
                return [
                    this.black(75),
                    this.darkBlue(75),
                    this.blue(75),
                    this.red(75),
                    this.yellow(75)
                ];
            case 50:
                return [
                    this.black(50),
                    this.darkBlue(50),
                    this.blue(50),
                    this.red(50),
                    this.yellow(50)
                ];
            case 25:
                return [
                    this.black(25),
                    this.darkBlue(25),
                    this.blue(25),
                    this.red(25),
                    this.yellow(25)
                ];
            default:
                return [
                    this.black(100),
                    this.darkBlue(100),
                    this.blue(100),
                    this.red(100),
                    this.yellow(100)
                ];
        }
    }

    black(type?): string | any[] | any {
        if (!type) {
            let type = 'default';
        }
        switch (type) {
            case "range":
                return ['#00000', '#404040', '#7F7F7F', '#BFBFBF'];
            case 100:
                return '#00000';
            case 75:
                return '#404040';
            case 50:
                return '#7F7F7F';
            case 25:
                return '#BFBFBF';
            default:
                return '#00000';
        }
    }
    darkBlue(type?): string | any[] | any {
        if (!type) {
            let type = 'default';
        }
        switch (type) {
            case "range":
                return ['#18375F', '#526987', '#8B9BAF', '#C5CDD7'];
            case 100:
                return '#18375F';
            case 75:
                return '#526987';
            case 50:
                return '#8B9BAF';
            case 25:
                return '#C5CDD7';
            default:
                return '#18375F';
        }
    }
    blue(type?): string | any[] | any {
        if (!type) {
            let type = 'default';
        }
        switch (type) {
            case "range":
                return ['#0072BC', '#4095CD', '#7FB8DD', '#BFDCEE'];
            case 100:
                return '#0072BC';
            case 75:
                return '#4095CD';
            case 50:
                return '#7FB8DD';
            case 25:
                return '#BFDCEE';
            default:
                return '#0072BC';
        }
    }
    green(type?): string | any[] | any {
        if (!type) {
            let type = 'default';
        }
        switch (type) {
            case "range":
                return ['#00B398', '#40C6B2', '#7FD9CB', '#BFECE5'];
            case 100:
                return '#00B398';
            case 75:
                return '#40C6B2';
            case 50:
                return '#7FD9CB';
            case 25:
                return '#BFECE5';
            default:
                return '#00B398';
        }
    }
    red(type?): string | any[] | any {
        if (!type) {
            let type = 'default';
        }
        switch (type) {
            case "range":
                return ['#EF4A60', '#F37788', '#F7A4AF', '#FBD2D7'];
            case 100:
                return '#EF4A60';
            case 75:
                return '#F37788';
            case 50:
                return '#F7A4AF';
            case 25:
                return '#FBD2D7';
            default:
                return '#EF4A60';
        }
    }
    yellow(type?): string | any[] | any {
        if (!type) {
            let type = 'default';
        }
        switch (type) {
            case "range":
                return ['#FAEB00', '#FBF040', '#FCF57F', '#FEFABF'];
            case 100:
                return '#FAEB00';
            case 75:
                return '#FBF040';
            case 50:
                return '#FCF57F';
            case 25:
                return '#FEFABF';
            default:
                return '#FAEB00';
        }
    }
}