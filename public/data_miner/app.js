jQuery(document).ready(function($){
  var Site = function(){
    var
    b,
    t,
    f,
    interval,
    formData,
    action,
    nextAction,
    alertClass,
    responseContainer,
    seriesActions,
    url;
    var response = function(d) {
      responseContainer = f.find('.response');
      responseContainer.html('').attr('class','response');
      if(typeof d !== 'undefined'){
        if(d.status === false){
          alertClass = 'danger';
        } else {
          alertClass = 'success';
        }
        responseContainer.addClass('alert alert-'+alertClass).html(d.message);
        // setTimeout(function(){}, 10000);
      }
    };
    var bLoading = function() {
      if(b.hasClass('loading')){
        b.removeClass('loading');
      } else {
        b.addClass('loading');
      }
    };
    var removeFieldError = function() {
      if ($('.has-error').length > 0) {
        $('.has-error').find('.help-block').remove();
        $('.has-error').removeClass('has-error');
      }
      $('.error-block').remove();
    };
    var showFieldError = function(errors) {
      // removeFieldError();
      $.each(errors, function(i, v) {
        var field = f.find('[name="' + i + '"]');
        console.log(i);
        if (field.length > 0) {
          var errorblock = '<span id="' + i + '-error" class="help-block">' + v.join(', ') + '</span>';
          if (field.parents('.checkbox').length || field.parents('.radio').length) {
            field.closest('.form-group').addClass('has-error').children('label').append(errorblock);
          } else if (field.parents('.input-group').length) {
            field.addClass('has-error').parent().after(errorblock);
            field.closest('.input-group').addClass('has-error');
          } else {
            field.parent().addClass('has-error');
            field.parent().append(errorblock);
          }
        }
      });
    };
    var ajaxCallback = function(f, u, c, t) {
      t = typeof t !== 'undefined' ? t : 'POST';
      bLoading();
      if (f) {
        $.ajax({
          type: t,
          url: u,
          data: f,
          dataType: 'json'
          // }).done(function (d, status, xhr) {
        }).done(function(d) {
          bLoading();
          c(d);
        }).fail(function(jqXHR, textStatus) {
          console.log("Request failed: " + textStatus);
          bLoading();
        });
      }
    };
    var initButton = function(){
      $(document).on('click','button, .btn, .hasAction',function(e){
        b = $(this);
        action = b.data('action');
        f = b.closest('form');
        if (action && !b.hasClass('loading')) {
          e.preventDefault();
          if (b.hasClass('noform')) {
            actions();
          } else if (f.length) {
            removeFieldError();
            // If validator defined then check
            if(typeof $.validator !== 'undefined'){
              if(b.hasClass('dontvalidate')){
                actions();
              } else {
                if (f.valid()) {
                  actions();
                }
              }
            } else {
              actions();
            }
          } else {
            actions();
          }
        }
      })
    };
    var actions = function(fd){
      // response();
      if(typeof fd === 'undefined'){
        if (typeof f !== 'undefined') {
        }
        formData = f.serialize();
      } else {
        formData = fd;
      }
      switch (action) {
        case 'changeStudioState':
          formData = 'status='+b.data('status')+'&id='+b.data('id');
          ajaxCallback(formData, 'state.php', function(d) {
            $('a[data-action="generateConfig"]').html('Data Changed! Please generate config before leaving').removeClass('btn-success').addClass('btn-warning');
            if (d.status === true) {
              if(b.hasClass('btn-warning')){
                b.removeClass('btn-warning').addClass('btn-danger').html('Disable');
              } else {
                b.removeClass('btn-danger').addClass('btn-warning').html('Enable');
              }
            }
          });
          break;
        case 'generateConfig':
          formData = 'test=1';
          ajaxCallback(formData, 'generate.php', function(d) {
            if (d.status === true) {
              b.html('Config Generated');
              setTimeout(function(){ b.html('Generate Config'); }, 3000);
            }
          });
          break;
        case 'saveLocation':
          removeFieldError();
          ajaxCallback(formData, 'savelocation.php', function(d) {
            response(d);
            if (d.status === true) {
              setTimeout(function(){ location.reload(); }, 2000);
            } else {
              showFieldError(d.errors);
            }
          });
          break;
        case 'deleteLocation':
          removeFieldError();
          ajaxCallback(formData, 'deletelocation.php', function(d) {
            response(d);
            if (d.status === true) {
              setTimeout(function(){ location.reload(); }, 2000);
            } else {
              showFieldError(d.errors);
            }
          });
          break;
        case 'modal':
          modalbody = b.data('modalbody');
          modalid = b.data('modalid');
          $('#'+modalid).remove();
          modaldata = b.data('modaldata');
          // console.log(modaldata);
          formData = 'modalid='+modalid+'&modaldata='+JSON.stringify(modaldata);
          ajaxCallback(formData, modalbody, function(d) {
            console.log(d);
            if (d.status === true) {
              $('body').append(d.html);
              $('#'+modalid).modal('show');
            }
          });
          break;
      }
    }
    var init = function(){
      initButton();
      console.log('Web JS initiated');
    };
    return {
      init: init
    };
  }();
  Site.init();
})
