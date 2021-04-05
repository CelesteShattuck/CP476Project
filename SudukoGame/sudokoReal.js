drawBoard = function(){    
    this.id =  'sudoku_container';
    var puzzle = "..3......4.......7....9.4.....1..8...7..89..2...64..3.3.....2.48..26..7316......." //get from file
    var answer = "523471689498526317716893425234157896671389542985642731357918264849265173162734958" //get from json
    //draw board 

    var sudoku_board = $('<div></div>').addClass('sudoku_board');
    for (i=0; i < 9; i++) {
        for (j=0; j < 9; j++) {
            position       = { x: i+1, y: j+1 };
            group_position = { x: Math.floor((position.x -1)/this.n), y: Math.floor((position.y-1)/this.n) };
            
            var value = (puzzle[i+j] > 0 ? puzzle[i+j] : ''),
                cell = $('<div>value</div>')
                            .addClass('cell')
                            .attr('x', position.x)
                            .attr('y', position.y)
                            .attr('gr', group_position.x +''+ group_position.y)
                            .html('<span>'+ value +'</span>' );
            cell.appendTo(sudoku_board);
        }
    }
    
};
