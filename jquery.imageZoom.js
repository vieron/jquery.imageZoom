/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
*/
// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	}
});




//  (_)_ __ ___   __ _  __ _  ___|__  /___   ___  _ __ ___  
//  | | '_ ` _ \ / _` |/ _` |/ _ \ / // _ \ / _ \| '_ ` _ \ 
//  | | | | | | | (_| | (_| |  __// /| (_) | (_) | | | | | |
//  |_|_| |_| |_|\__,_|\__, |\___/____\___/ \___/|_| |_| |_|
;(function($, document, window, undefined){

      var pluginName = 'imageZoom',
          defaults = {
              easing: "easeInOutQuad",
              speed : 300,
              overlay : true, // show background overlay
              back_to_origin : true, // back to image origin between image transitions
              open_event : 'click', // or false for no event attachment,
              data_url_attr : 'href',
              url : false ,// if url is diferent to false, this takes preference over data_url_attr option
              data_group_attr : 'rel',
              group : false // if group is diferent to false, this takes preference over data_group_attr option
          };
          
      var $body = $(document.body),
          $window = $(window),
          $html = $('html'),
          $image_box = $('<div class="m_image_zoom" style="opacity:0;"></div>').html('<a class="close" href="#">X</a><div class="img"></div> <a class="arrow prev" href="#">Prev</a> <a class="arrow next" href="#">Next</a>').appendTo($body),
          $image_box_inner = $image_box.find('.img'),
          $overlay = $('<div class="m_overlay" style="display:none;"></div>').appendTo($body),
          $arrow_next = $image_box.find('.next'),
          $arrow_prev = $image_box.find('.prev'),
          $controls = $arrow_next.add($arrow_prev),
          open = false,
          instance_triggered_open = null,
          open_group = false,
          image_groups = {};
          
          
      var close = function(callback){
        var that = instance_triggered_open;
        
        if( open == false ) {
          if( callback && typeof callback == 'function' ) callback.call( that );
          return false;
        }
        
        if (open == true) {
          var offset = that.element.offset(),
              animate_conf = {
                'opacity' : 0,
                'top' : offset.top,
                'left' : offset.left,
                'width' : that.element.width(),
                'height' : that.element.height()
              };
              
          $image_box
            .animate( animate_conf, that.options.speed, that.options.easing, function(){
              $image_box.hide().css('overflow', 'hidden');
              if (callback && typeof callback == 'function') callback.call( that );
            });
        };
        
        if (that.options.overlay) that.closeOverlay();
        
        open = false;
        
        return false;
      },
      
      next_image_in_group = function(){
        var inst = open_in_group('next');
        return false;
      },
      
      prev_image_in_group = function(){
        var inst = open_in_group('prev');
        return false;
      },
      
      open_in_group = function(dir){
        var i =  $.inArray( instance_triggered_open, image_groups[open_group] ),
            g = image_groups[open_group],
            inst;
        if (i == -1) return false;
        
        if (dir == 'next') inst = ( g[i+1] ? g[i+1] : g[0] );
        if (dir == 'prev') inst = ( g[i-1] ? g[i-1] : g[ g.length-1 ] );
        
        if (inst) Plugin.prototype.openClickHandler.call( inst );
        
      },
      
      resize = function(){
        if (open) Plugin.prototype.expandImage.call( instance_triggered_open );
      }
      
      
      $image_box.find('.close').on('click', close);
      $arrow_next.on('click', next_image_in_group);
      $arrow_prev.on('click', prev_image_in_group);
      $window.on( 'onorientationchange resize.imagezoom' , resize);
      // $window.on( 'onorientationchange resize.imagezoom scroll' , resize);
      
      $(document).bind('keydown.imagezoom',function(e){
        if (open) {
            var key = e.keyCode;
            if (key == 37) prev_image_in_group();
            if (key == 39) next_image_in_group();
            if (key == 27) close();
        };
				// return false;
			});
      
      
      function Plugin( element, options ) {
          this.element = $(element);
          this.spinner = $('<span class="spinner"></span>').appendTo(this.element);
          this.options = $.extend( {}, defaults, options) ;
          this._defaults = defaults;
          this._name = pluginName;
          this.fullimage_url = (this.options.url != false) ? this.options.url : this.element.attr( this.options.data_url_attr);
          this.group = (this.options.group != false) ? this.options.group : (this.element.attr( this.options.data_group_attr ) || false);
          this.fullimage = $('<img src="'+this.fullimage_url+'" >');
          this.init();
      }

      Plugin.prototype = {
        init : function(){
          var css_pos = this.element.css('position');
          if ( $.inArray(css_pos, ['relative', 'absolute', 'fixed']) == -1 ) this.element.css('position', 'relative');
          if ( this.group != false ) this.setGroup();
          if ( this.options.open_event != false ) this.element.on( this.options.open_event , $.proxy(this.openClickHandler, this));
          
          this.element.data('api', this);
        },
        
        setGroup : function(){
          console.log(this.group);
          if (this.group == false) return false;
          if (typeof image_groups[ this.group ] === 'undefined') image_groups[ this.group ] = [];
          image_groups[ this.group ].push( this );
        },
        
        openClickHandler : function(e){
          var that = this;
          
          if (this.options.back_to_origin) {
            close(function(){
              that.open();
            });
          }else{
            that.open();
          };
          
          
          return false;
        },
        
        open : function(){
          var that = this;
          
          this.element.addClass('iz_loading');
          
          if (this.options.back_to_origin == true) {
            $image_box_inner.empty().append(this.fullimage);

            this.offset = this.element.offset();

            //posicionar donde la actual
            $image_box.css({
              'display' : 'block',
              'top' : this.offset.top,
              'left' : this.offset.left,
              'width' : this.element.width(),
              'height' : this.element.height()
            });
            
            this.preloadImage( this.fullimage_url , $.proxy( this.expandImage, this) );
          }else{
            this.preloadImage( this.fullimage_url , $.proxy( function(){
              this.expandImage();
              $image_box_inner.fadeOut(200, function(){
                $image_box_inner.empty().append(that.fullimage);
                $image_box_inner.fadeIn('fast');
              })
            }, this) );
          }
        
        },
        
        expandImage : function(callback){
          var that = this;
          
          this.element.removeClass('iz_loading');
          
          if (this.options.overlay) { this.showOverlay(); };
          
          this.fullimage_width = this.getMaxImageWidth();
          this.fullimage_height = this.getMaxImageHeight();
          
          var ratioW = this.original_fullimage_width/this.original_fullimage_height , 
              ratioH = this.original_fullimage_height/this.original_fullimage_width ,
              ratio = ratioW < ratioH ? ratioH : ratioW;
          
          if (this.original_fullimage_width > this.fullimage_width) {
            this.fullimage_height = this.fullimage_width*ratioH;
          }else if (this.original_fullimage_height > this.fullimage_height) {
            this.fullimage_width = this.fullimage_height*ratioW;
          }
          
          if (this.fullimage_height > $window.height()-100) {
            this.fullimage_height = $window.height()-100;
            this.fullimage_width = this.fullimage_height*ratioW;
          };
          
          var animate_conf = {
            'left' : this.getHorizontalCenter(),
            'top' : this.getVerticalCenter(),
            'width' : this.fullimage_width,
            'height' : this.fullimage_height,
            'opacity' : 1
          };
          
          $image_box.show()
            .stop()
            .animate(animate_conf, this.options.speed, this.options.easing, function(){
              if(callback && typeof callback == 'function') callback.call(that);
              $image_box.css('overflow', 'visible');
            });
          
          open = true;
          instance_triggered_open = this;
          
          if ( image_groups[ this.group ] && image_groups[ this.group ].length > 1) {
            open_group = this.group;
            $controls.show();
          }else{
            $controls.hide();
          }
          
        },
        
        close : function(callback){
          close.call(this);
        },
        
        getMaxImageWidth : function(){
          var ww = $window.width()-100;
          var w = (this.original_fullimage_width > ww) ? ww : this.original_fullimage_width;
          return w;
        },
        
        getMaxImageHeight : function(){
          var wh =  $window.height()-100;
          var h = (this.original_fullimage_height > wh) ? wh : this.original_fullimage_height;
          return h;
        },

        preloadImage : function(url, callback){
          var img = new Image();
          var that = this;
          img.onload = function(){
            that.original_fullimage_width = img.width;
            that.original_fullimage_height = img.height;
            that.fullimage_width = img.width;
            that.fullimage_height = img.height;
            if(callback && typeof callback == 'function') callback.call(this);
          };
          
          img.src = url;
        },
        
        getHorizontalCenter : function(){
         var ww = $window.width();
         return ((ww/2)-(this.fullimage_width/2)) 
        },
        
        getVerticalCenter : function(){
         var wh = $window.height();
         return ((wh/2)-(this.fullimage_height/2)) + $window.scrollTop()
        },
        
        showOverlay : function(){
          
          var h = $body.height(),
              w = $body.outerWidth(true);  
          if ( h < $window.height()) h =  $window.height();
          
          $overlay.css({
            'width' : w,
            'height' : h
          }).fadeIn();
          
        },
        
        closeOverlay : function(){
          $overlay.fadeOut();
        }
        
      }
      

      $.fn[pluginName] = function ( options ) {
          return this.each(function () {
              if (!$.data(this, 'plugin_' + pluginName)) {
                  $.data(this, 'plugin_' + pluginName,
                  new Plugin( this, options ));
              }
          });
      }

})(jQuery, document, window);
