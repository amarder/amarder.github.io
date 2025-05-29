function populate() {
  var inputs = $('input');
  var weights = {};
  inputs.map(function(i) {
    weights[inputs[i].name] = Number(inputs[i].value);
  });

  keys = Object.keys(weights);
  var columns = keys.map(function(k) {
    return alasql('SELECT COLUMN ' + k + ' FROM raw');
  })

  var means = columns.map(function(x) {
    return math.mean(x);
  });
  var sds = columns.map(function(x) {
    return math.std(x)
  });
  
  var components = Object.keys(weights).map(function(x) {
    var i = Object.keys(weights).indexOf(x);
    return [
      weights[x], '* (', x, '-', means[i], ') /', sds[i]
    ].join(' ');
  })
  
  var formula = components.join(' + ');
  
  // Create new table with score.
  var cmd = 'SELECT *, ' + formula + ' AS score FROM raw ORDER BY score DESC LIMIT 10'
  var rows = alasql(cmd);

  $('#data').empty()
  rows.map(function(row) {
    var values = [row.title, row.authors, numeral(row.sales_rank).format('0,0'),
  numeral(row.pages).format('0,0'), numeral(row.price).format('$0.00'), numeral(row.score).format('0.00')];
    var row = '<tr><td>' + values.join('</td><td>') + '</td></tr>';
    $('#data').append(row);
  });
  // TODO: I need both of these lines to get tablesaw to size
  // correctly after this ajax call.
  $('#books').table().data("table").refresh();
  $(window).trigger('resize');
}

function clean(book) {
  var result = {
    title: '<a href="' + book.url + '">' + book.title + '</a>',
    authors: book.authors.join(', '),
    sales_rank: Number(book.sales_rank),
    pages: Number(book.pages),
    price: book.price / 100
  };
  return result;
}

function init(url) {
  $.getJSON(url, success=function(data, textStatus, jqXHR) {
    var cleaned = data.map(clean);

    alasql("DROP TABLE IF EXISTS raw");
    alasql("CREATE TABLE raw");
    alasql.tables.raw.data = cleaned;
    
    populate();
  });
}
