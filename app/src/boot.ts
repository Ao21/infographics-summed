import * as d3 from 'd3';
import {Subject} from 'rxjs/Rx';

import {DataService} from './services/data';
import {SunburstHaloSummed} from './component/sunburst_halo_summed/sunburst_halo_summed';
import {WorldProjection} from './component/projection/projection';

export class Bootstrap {
  data: DataService = new DataService();
  worldProjection: WorldProjection = new WorldProjection();
  sunburstHaloSummed: SunburstHaloSummed = new SunburstHaloSummed();
  resizeEvent: Subject<any> = new Subject();


  constructor() {

    this.resizeEvent.debounceTime(500).subscribe(next => {
      d3.select('#graph').selectAll("*").remove();
      this.init();
    });
    this.init();

  }

  init() {
    this.data.loadData().then((next) => {
      this.sunburstHaloSummed.init(next);
      window.onresize = (event) => {
        this.resizeEvent.next(true);
      };

    }).catch((err) => {
      console.log(err);
    });
  }
}

let app = new Bootstrap();