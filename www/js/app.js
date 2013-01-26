
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    require('receiptverifier');

    // Installation button
    require('./install-button');

    // Install the layouts
    require('layouts/layouts');

    // Write your app here.


    function formatDate(d) {
        return (d.getMonth()+1) + '/' +
            d.getDate() + '/' +
            d.getFullYear();
    }

    // List view

    var list = $('.list').get(0);
    list.add({ title: 'Lundi: Cr&ecirc;pes',
               jour: 'Lundi',
               plat: 'Cr&ecirc;pes',
               desc: 'Des bonnes cr&ecirc;pes au nutella' });
    list.add({ title: 'Mardi: Soupe',
               jour: 'Mardi',
               plat: 'Soupe',
               desc: 'Une soupe de l&eacute;gume maison' });

    // Detail view

    var detail = $('.detail').get(0);
    detail.render = function(item) {
        $('.title', this).html(item.get('jour'));
        $('.jour', this).html(item.get('jour'));
        $('.plat', this).html(item.get('plat'));
        $('.desc', this).html(item.get('desc'));
    };

    // Edit view

    var edit = $('.edit').get(0);
    edit.render = function(item) {
        item = item || { id: '', get: function() { return ''; } };

        $('input[name=id]', this).val(item.id);
        $('input[name=jour]', this).val(item.get('jour'));
        $('input[name=plat]', this).val(item.get('plat'));
        $('input[name=desc]', this).val(item.get('desc'));
    };

    edit.getTitle = function() {
        var model = this.view.model;

        if(model) {
            return model.get('jour');
        }
        else {
            return 'New';
        }
    };

    $('button.add', edit).click(function() {
        var el = $(edit);
        var jour = el.find('input[name=jour]');
        var plat = el.find('input[name=plat]');
        var desc = el.find('input[name=desc]');
        var model = edit.model;

        if(model) {
            model.set({ title: jour.val() + ': ' + plat.val(),
                        jour: jour.val(),
                        plat: plat.val(),
                        desc: desc.val() });
        }
        else {
            list.add({ title: jour.val() +': ' + plat.val(),
                       jour: jour.val(),
                       plat: plat.val(),
                       desc: desc.val() });
        }

        edit.close();
    });
});