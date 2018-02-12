export function applyPointHaloOptions(Highcharts) {
    Highcharts.wrap(Highcharts.Point.prototype, 'setState', function setState(proceed, ...args) {
        const tmp = this.series.options.states.hover.halo;
        this.series.options.states.hover.halo = this.halo || this.series.options.states.hover.halo;

        proceed.apply(this, args);

        this.series.options.states.hover.halo = tmp;
    });
}
