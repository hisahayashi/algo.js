/**
 * ALGO.ShapeCtrl
 */
ALGO.ShapeCtrl = {

  createID: function( _ary, _length ){
    var strings = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var length = ( _length )? _length: 12;
    var id = '';
    for( var i = 0; i < length; i++ ){
      var c_length = strings.length;
      var c_index = Math.floor( Math.random() * c_length );
      id += strings.charAt( c_index );
    }
    if( _ary.indexOf( id ) > -1 ){
      arguments.callee( _ary, _length );
    }
    return id;
  }

};
