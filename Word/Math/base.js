function CMathBase()
{
    // {align: {height: alpha, width: betta}}  alpha & betta коэффициенты в интервале от 0 до 1, либо CENTER

    CENTER = -1;

    this.pos = null;
    this.size = null;

    this.CurPos_X = 0;
    this.CurPos_Y = 0;
    this.empty = false;
    this.SUBCONTENT = true;
    this.reduct = 1;

    this.nRow = 0;
    this.nCol = 0;

    this.Parent = null;
    this.Composition = null; // ссылка на общую формулу

    this.textPrp = new CMathTextPrp(); // для рассчета размера расстояний
    this.RunPrp = new CMathTextPrp(); // запоминаем, если передаются спец. настройки для контента

    //todo
    //переделать
    this.bMObjs = false;

    this.elements = null;

    this.dW = 0; //column gap, gap width
    this.dH = 0; //row gap, gap height

    this.alignment =
    {
        hgt: null,
        wdt: null
    };

    return this;
}

CMathBase.prototype =
{
    setContent: function()
    {
        this.elements = new Array();

        for(var i=0; i < this.nRow; i++)
        {
            this.elements[i] = new Array();
            for(var j = 0; j < this.nCol; j++)
            {
                this.elements[i][j] = new CMathContent();
                this.elements[i][j].relate(this);
                this.elements[i][j].setReduct(this.reduct);
                this.elements[i][j].setComposition(this.Composition);
                this.elements[i][j].setRunPrp(this.RunPrp);

            }
        }
    },
    setDimension: function(countRow, countCol)
    {
        this.nRow = countRow;
        this.nCol = countCol;

        this.alignment.hgt = new Array();
        this.alignment.wdt = new Array();

        for(var u = 0; u < this.nCol ; u++)
            this.alignment.hgt[u] = CENTER;

        for(u=0; u < this.nRow; u++)
            this.alignment.wdt[u] = CENTER;

    },
    getTxtPrp: function()
    {
        var txtPrp = new CMathTextPrp();
        Common_CopyObj2(txtPrp, this.Composition.TxtPrp);

        txtPrp.Merge(this.textPrp);

        txtPrp.FontSize *= this.reduct;

        return txtPrp;
    },
    getOwnTPrp: function()
    {
        return this.txtPrp();
    },
    /*getTxtPrp_2: function()
    {
        var txtPrp = this.getTxtPrp();
        txtPrp.FontSize *= this.reduct;

        return txtPrp;
    },*/
    setComposition: function(Compos)
    {
        this.Composition = Compos;

        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
            {
                if(!this.elements[i][j].IsJustDraw())
                    this.elements[i][j].setComposition(Compos);
            }
    },
    getRunPrp: function()
    {
        return this.textPrp;
    },
    setRunPrp: function(txtPrp)
    {
        this.RunPrp.Merge(txtPrp);
        this.setTxtPrp(txtPrp);
    },
    fillPlaceholders: function()
    {
         for(var i=0; i < this.nRow; i++)
             for(var j = 0; j < this.nCol; j++)
                if(!this.elements[i][j].IsJustDraw())
                 this.elements[i][j].fillPlaceholders();
    },
    setReduct: function(coeff)
    {
        this.reduct = this.reduct*coeff;
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
            {
                if(! this.elements[i][j].IsJustDraw() )
                    this.elements[i][j].setReduct(coeff);
            }
    },
    addMCToContent: function()
    {
        if(arguments.length == this.nRow*this.nCol)
        {
            this.elements = new Array();
            for(var i = 0; i < this.nRow; i++)
            {
                this.elements[i] = new Array();
                for(var j = 0; j < this.nCol; j++)
                {
                    this.elements[i][j] = arguments[j + i*this.nCol];
                    this.elements[i][j].relate(this);
                    if(! this.elements[i][j].IsJustDraw() )
                    {
                        this.elements[i][j].setComposition(this.Composition);
                        this.elements[i][j].setReduct(this.reduct);
                        this.elements[i][j].setRunPrp(this.RunPrp);
                    }
                    this.elements[i][j].bMObjs = true;
                }
            }
        }
        else
        {
            this.init();
            this.fillPlaceholders();
        }
    },
    relate: function(parent)
    {
        this.Parent = parent;
    },
    cursor_moveLeft: function()
    {
        var bUpperLevel = false;
        //var oldPos = {x: this.CurPos_X, y: this.CurPos_Y}; //старая позиция нужна когда  только в случае если находимся в базовом контенте, а здесь нет, т.к. всегда есть родитель

        do{
            if( this.CurPos_Y > 0  )
            {
                this.CurPos_Y--;
            }
            else if(this.CurPos_X > 0)
            {
                this.CurPos_X--;
                this.CurPos_Y = this.nCol - 1;
            }
            else
            {
                bUpperLevel = true;
                break;
            }
        } while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )

        //из цикла вышли если bJustDraw = false  or  bUpperLevel = true

        var content;
        if(bUpperLevel)
        {
            var movement = this.Parent.cursor_moveLeft();
            content = movement.SelectContent;
        }
        else
        {
            this.elements[ this.CurPos_X ][ this.CurPos_Y].end();
            content = this.elements[this.CurPos_X][this.CurPos_Y].goToLastElement(); //если внутренний элемент не контент, а базовый класс, вернется последний элемент этого класса
        }

        return { SelectContent: content };
    },
    cursor_moveRight: function()
    {
        var bUpperLevel = false;

        do{
            if( this.CurPos_Y < this.nCol - 1 )
            {
                this.CurPos_Y++;
            }
            else if(this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
                this.CurPos_Y = 0;
            }
            else
            {
                bUpperLevel = true;
                break;
            }
        } while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )

        var content;
        if( bUpperLevel )
        {
            var movement = this.Parent.cursor_moveRight();
            content = movement.SelectContent;
        }
        else
        {
            this.elements[ this.CurPos_X ][ this.CurPos_Y ].home();
            content = this.elements[this.CurPos_X][this.CurPos_Y].goToFirstElement();
        } //если внутренний элемент не контент, а базовый класс, вернется первый элемент этого класса

        return { SelectContent: content };
    },
    // эта функция здесь необходима для случая с n-арными операторами : когда передаем n-арный оператор с итераторами и аргумент
    IsJustDraw: function()
    {
        return false;
    },
    select_moveRight: function()
    {
        var res = this.elements[this.CurPos_X][this.CurPos_Y].select_moveRight();

        return res;
    },
    select_moveLeft: function()
    {
        var res = this.elements[this.CurPos_X][this.CurPos_Y].select_moveLeft();

        return res;
    },
    goToLastElement: function()
    {
        this.CurPos_X = this.nRow - 1;
        this.CurPos_Y = this.nCol - 1;
        while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )
        {
            if( this.CurPos_Y > 0)
            {
                this.CurPos_Y--;
            }
            else if(this.CurPos_X > 0)
            {
                this.CurPos_X--;
                this.CurPos_Y = this.nCol - 1;
            }
        }

        this.elements[this.CurPos_X][this.CurPos_Y].end();

        return this.elements[this.CurPos_X][this.CurPos_Y].goToLastElement();
    },
    goToFirstElement: function()
    {
        this.CurPos_X = 0;
        this.CurPos_Y = 0;
        while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )
        {
            if( this.CurPos_Y < this.nCol - 1 )
            {
                this.CurPos_Y++;
            }
            else if(this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
                this.CurPos_Y = 0;
            }
        }

        this.elements[this.CurPos_X][this.CurPos_Y].home();

        return this.elements[this.CurPos_X][this.CurPos_Y].goToFirstElement();
    },
    // TODO
    // пересмотреть логику
    // TODO
    // пересомтреть this.gaps / this.dW
    // остановиться на чем-нибудь одном
    goToUpperLevel: function(coord)
    {
        //пришли из текущего контента

        var state = false, bUp = false, content = null;
        var alignPrev = this.align(this.CurPos_X, this.CurPos_Y);

        var crd = {x: coord.x + alignPrev.x, y: coord.y};

        if( this.CurPos_X > 0 )
        {
            this.CurPos_X--;
            while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() &&  this.CurPos_X > 0)
            {
                this.CurPos_X--;
            }
            if( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() ) // все элементы только для отрисовки и дошли до конца
            {
                this.CurPos_X = prevPos.x;
                state = false;
            }
            else
                state = true;
        }

        if( state )
        {
            bUp = true;
            var size = this.elements[this.CurPos_X][this.CurPos_Y].size;
            var alignCurr = this.align(this.CurPos_X, this.CurPos_Y);
            crd.y = size.height;

            if( crd.x < alignCurr.x )
                crd.x = 0;
            else if( crd.x > alignCurr.x + size.width )
                crd.x = size.width;
            else
                crd.x = crd.x - alignCurr.x;
            content = this.elements[this.CurPos_X][this.CurPos_Y].afterDisplacement(crd);

        }
        else
        {
            var maxWH = this.getWidthsHeights();
            var widthToEl = 0;
            for(var j = 0; j < this.CurPos_Y; j++)
                widthToEl += maxWH.widths[j] + this.dW;
                //widthToEl += maxWH.widths[j] + this.gaps.column[j+1];

            crd.x += widthToEl;
            var upLevel = this.Parent.goToUpperLevel(crd);
            bUp = upLevel.bUp;
            if(bUp)
                content = upLevel.content;
            else
                content = null;
        }

        return {bUp: bUp, content: content};

    },
    // TODO
    // пересмотреть логику
    goToLowerLevel: function(coord)
    {
        var state = false, bLow = false, content = null;
        var alignPrev = this.align(this.CurPos_X, this.CurPos_Y);

        var crd = {x: coord.x + alignPrev.x, y: coord.y};

        if( this.CurPos_X < this.nRow - 1 )
        {
            this.CurPos_X++;
            while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() && this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
            }
            if( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() ) // все элементы только для отрисовки и дошли до конца
            {
                this.CurPos_X = prevPos.x;
                state = false;
            }
            else
                state = true;
        }

        if( state )
        {
            bLow = true;
            var size = this.elements[this.CurPos_X][this.CurPos_Y].size;
            var alignCurr = this.align(this.CurPos_X, this.CurPos_Y);
            crd.y = 0;

            if( crd.x < alignCurr.x )
                crd.x = 0;
            else if( crd.x > alignCurr.x + size.width )
                crd.x = size.width;
            else
                crd.x = crd.x - alignCurr.x;
            content = this.elements[this.CurPos_X][this.CurPos_Y].afterDisplacement(crd);
        }
        else
        {
            var maxWH = this.getWidthsHeights();
            var widthToEl = 0;
            for(var j = 0; j < this.CurPos_Y; j++)
                widthToEl += maxWH.widths[j] + this.dW;
                //widthToEl += maxWH.widths[j] + this.gaps.column[j+1];

            crd.x += widthToEl;
            var lowLevel = this.Parent.goToLowerLevel(crd);
            bLow = lowLevel.bLow;

            if(bLow)
                content = lowLevel.content;
            else
                content = null;

        }

        return {bLow: bLow, content: content};
    },
    afterDisplacement: function(coord) //аналог mouseDown
    {
        var disp = this.findDisposition(coord);
        this.CurPos_X = disp.pos.x;
        this.CurPos_Y = disp.pos.y;

        var content = this.elements[this.CurPos_X][this.CurPos_Y].afterDisplacement(disp.mCoord);

        return content;
    },
    drawSelect: function()
    {
        this.elements[this.CurPos_X][this.CurPos_Y].drawSelect();
    },
    home: function()
    {
        this.CurPos_X = 0;
        this.CurPos_Y = 0;
        while(this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw())
        {
            if( this.CurPos_Y < this.nCol - 1 )
            {
                this.CurPos_Y++;
            }
            else if(this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
                this.CurPos_Y = 0;
            }
        }

        this.elements[this.CurPos_X][this.CurPos_Y].home();
    },
    end: function()
    {
         this.CurPos_X = this.nRow - 1;
         this.CurPos_Y = this.nCol - 1;
         while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )
         {
             if( this.CurPos_Y > 0)
             {
                 this.CurPos_Y--;
             }
             else if(this.CurPos_X > 0)
             {
                 this.CurPos_X--;
                 this.CurPos_Y = this.nCol - 1;
             }
         }

         this.elements[this.CurPos_X][this.CurPos_Y].end();

    },
    mouseUp: function()
    {
        this.elements[this.CurPos_X][this.CurPos_Y].mouseUp();
     },
    getWidthsHeights: function()
    {
        var Widths = [];
        for(var tt = 0; tt < this.nCol; tt++ )
        Widths[tt] = 0;

        var Ascents = [];
        var Descents = [];

        for(tt = 0; tt < this.nRow; tt++ )
        {
            Ascents[tt] = 0;
            Descents[tt] = 0;
        }

        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol ; j++)
            {
                var size = this.elements[i][j].size;
                Widths[j] = ( Widths[j] > size.width ) ? Widths[j] : size.width;
                Ascents[i] = (Ascents[i] > size.center ) ? Ascents[i] : size.center;
                Descents[i] = (Descents[i] > size.height - size.center ) ? Descents[i] : size.height - size.center;
            }
        
        var Heights = [];
        for(tt = 0; tt < this.nRow; tt++ )
        {
            Heights[tt] = Ascents[tt] + Descents[tt];
        }

        return { widths: Widths, heights: Heights };
    },
    mouseDown: function( mCoord)
    {
        var elem = this.findDisposition( mCoord);

        this.CurPos_X = elem.pos.x;
        this.CurPos_Y = elem.pos.y;

        var res = this.elements[this.CurPos_X][this.CurPos_Y].mouseDown( elem.mCoord, elem.inside_flag );

        return res;

    },
    mouseMove: function( mCoord )
    {
        var state = true, SelectContent = null;
        var elem = this.findDisposition( mCoord);

        if(elem.pos.x == this.CurPos_X && elem.pos.y == this.CurPos_Y && elem.inside_flag === -1 )
        {
            var movement = this.elements[this.CurPos_X][this.CurPos_Y].mouseMove( elem.mCoord );
            SelectContent = movement.SelectContent;
            state = true;
        }
        else
            state = false;

        return {state: state, SelectContent: SelectContent};

    },
    align: function(pos_x, pos_y)
    {
        var _x, _y;

        if(this.alignment.hgt[pos_y] == CENTER)
        {
            var maxC = 0;

            for(var j = 0; j < this.nCol; j++)
            {
                _c = this.elements[pos_x][j].size.center;
                maxC = ( maxC > _c ) ? maxC : _c;
            }
            _y = (maxC - this.elements[pos_x][pos_y].size.center);
        }
        else
        {
            var maxH = 0;

            for(j=0; j < this.nCol; j++)
            {
                _h = this.elements[pos_x][j].size.height;
                maxH = ( maxH > _h ) ? maxH : _h;
            }
            _y = (maxH - this.elements[pos_x][pos_y].size.height)*this.alignment.hgt[pos_y];
        }

        var maxW  = 0;
        for(var i=0; i < this.nRow; i++)
        {
            var _w = this.elements[i][pos_y].size.width;
            maxW = ( maxW > _w ) ? maxW : _w;
        }

        if(this.alignment.wdt[pos_x] == CENTER)
            _x = (maxW - this.elements[pos_x][pos_y].size.width)*0.5;
        else
            _x = (maxW - this.elements[pos_x][pos_y].size.width)*this.alignment.wdt[pos_x];

        return {x: _x, y: _y};
    },
    findDisposition: function(mCoord)
    {
         var mouseCoord = {x: null, y: null},
             posCurs =    {x: null, y: null};


         var sumWidth = 0;
         var sumHeight = 0;

         var maxWH = this.getWidthsHeights();

         var Widths = maxWH.widths;
         var Heights = maxWH.heights;

         ///////////////////////////////

         if(mCoord.y > this.size.height)
             posCurs.x = this.nRow - 1;
         else
         {
             var _h = 0;
             for(var j = 0; j < this.nRow; j++)
             {
                 _h += Heights[j];
                 _h += this.dH/2;
                 if( mCoord.y <= _h )
                 {
                     posCurs.x = j;
                     break;
                 }
                 _h += this.dH/2;
             }
         }

         ///////////////////////////////

         //если не правильно посчитали, а элемент был justDraw, то будет ошибка

         if( mCoord.x > this.size.width )
             posCurs.y = this.nCol - 1;
         else
         {
             var _w = 0;
             for(var u = 0; u < this.nCol; u++)
             {
                 _w +=Widths[u];
                 _w += this.dW/2;
                 if( mCoord.x <= _w )
                 {

                     if( this.elements[posCurs.x][u].IsJustDraw() )
                     {
                         if(this.nRow > 1)
                         {
                             if(posCurs.x == 0)
                                 posCurs.x = 1;
                             else if(posCurs.x == this.nRow - 1)
                                 posCurs.x = this.nRow - 2;
                             else
                             {
                                 if( mCoord.y < (_h - Heights[posCurs.x]/2) )
                                     posCurs.x--;
                                 else
                                     posCurs.x++;
                             }
                             posCurs.y = u;
                         }
                         else if(this.nCol > 1)
                         {
                             if(u == 0)
                                 posCurs.y = 1;
                             else if(u == this.nCol - 1)
                                 posCurs.y = this.nCol - 2;
                             else
                             {
                                 if( mCoord.x < (_w - Widths[u]/2) )
                                     posCurs.y = u - 1;
                                 else
                                     posCurs.y = u + 1;
                             }

                         }
                         else
                             return; // не самое лучшее решение, в идеале если у нас если такая ситуация получилась
                         // (что сомнительно, в контенте один элемент с которым ничего нельзя сделать),
                         // то вставать  после этого элемента  в контенте на уровень выше
                         // лучше следить за подобными ситуациями, чтобы такого не было
                     }
                     else
                         posCurs.y = u;
                     break;
                 }
                 _w += this.dW/2;
             }
         }
         ////////////////////////////////

         for(var t = 0; t < posCurs.y; t++)
             sumWidth += Widths[t];
         for(t = 0; t < posCurs.x; t++)
             sumHeight += Heights[t];

         // флаг для случая, когда выходим за границы элемента и есть выравнивание относительно других элементов
         // -1 - в пределах границы
         // 0 - начало контента
         // 1 - конец контента
         // 2 - выщли за границы контента по Y

         var inside_flag = -1;

         if( posCurs.x != null && posCurs.y != null)
         {
             var size = this.elements[posCurs.x][posCurs.y].size;
             var align = this.align(posCurs.x, posCurs.y);
             if(mCoord.x < ( posCurs.y*this.dW + sumWidth + align.x ))
             {
                 mouseCoord.x = 0;
                 inside_flag = 0;
             }
             else if( mCoord.x > ( posCurs.y*this.dW + sumWidth + align.x + size.width ))
             {
                 mouseCoord.x = size.width;
                 inside_flag = 1;
             }
             else
                 mouseCoord.x = mCoord.x - ( posCurs.y*this.dW + sumWidth + align.x );


             if(mCoord.y < (posCurs.x*this.dH + sumHeight + align.y))
             {
                 mouseCoord.y = 0;
                 inside_flag = 2;
             }
             else if( mCoord.y > ( posCurs.x*this.dH + sumHeight + align.y + size.height ) )
             {
                 mouseCoord.y = size.height;
                 inside_flag = 2;
             }
             else
                 mouseCoord.y = mCoord.y - (posCurs.x*this.dH + sumHeight + align.y );
         }

         return {pos: posCurs, mCoord: mouseCoord, inside_flag: inside_flag};
    },
    setPosition: function(pos)
    {
        if(this.bMObjs === true)
            this.pos = {x: pos.x, y : pos.y};
        else
            this.pos = {x: pos.x, y: pos.y - this.size.center}; ///!!!!!!!!!!!!!!!!!!!!!!!!!!

        var maxWH = this.getWidthsHeights();
        var Widths = maxWH.widths;
        var Heights = maxWH.heights;

        var h = 0, w = 0;
        for(var i=0; i < this.nRow; i++)
        {
            w = 0;
            for(var j = 0; j < this.nCol; j++)
            {
                var al = this.align(i, j);
                this.elements[i][j].setPosition( {x: this.pos.x + al.x + this.dW*j + w , y: this.pos.y + al.y + this.dH*i + h  } );
                w += Widths[j];
            }
            h += Heights[i];
        }
    },
    draw: function()
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
                this.elements[i][j].draw();
    },
    remove: function()
    {
        return this.Parent.remove();
    },
    recalculateSize: function()
    {
        var _width = 0;
        var _height = 0;

        var maxWH = this.getWidthsHeights();

        this.setDistance();

        var Widths = maxWH.widths;
        var Heights = maxWH.heights;

        for( j = 0 ; j < this.nRow; j++ )
            _height += Heights[j];

        _height += this.dH*(this.nRow - 1);

        for( i=0; i < this.nCol ; i++)
            _width += Widths[i];

        _width += this.dW*(this.nCol - 1);

        var _center =  this.getCenter(_height);

        this.size = {width: _width, height: _height, center: _center};
    },
    RecalculateReverse: function()
    {
        this.recalculateSize();
        this.Parent.RecalculateReverse();
    },
    Resize: function()
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
                this.elements[i][j].Resize();

        this.recalculateSize();
    },
    getCenter: function(_height)
    {
        var res = 0;
        if(this.nRow > 1)
        {
            res = _height || this.size.height;
            res /=2;
        }
        else
            for(var i=0; i< this.nCol; i++)
                res = (this.elements[0][i].size.center > res) ?  this.elements[0][i].size.center : res;
        
        return res;
    },
    alignHor: function(pos, coeff)
    {
        if(pos!=-1)
            this.alignment.wdt[pos] = coeff;
        else
            for(var j = 0; j< this.alignment.wdt.length; j++)
                this.alignment.wdt[j] = coeff;

    },
    alignVer: function(pos, coeff)
    {
        if(pos!=-1)
            this.alignment.hgt[pos] = coeff;
        else
            for(var j = 0; j < this.alignment.hgt.length; j++)
                this.alignment.hgt[j] = coeff;
     },
    setDistance: function()
    {
        
    },
    getPosTwTarget: function()
    {
        var pos = this.elements[this.CurPos_X][this.CurPos_Y].getPosTwTarget();
        var align = this.align(this.CurPos_X, this.CurPos_Y);

        var maxWH = this.getWidthsHeights();
        var Heights = maxWH.heights,
            Widths = maxWH.widths;

        for(var t = 0; t < this.CurPos_Y; t++)
            pos.x += Widths[t];


        for(var t = 0; t < this.CurPos_X; t++)
            pos.y += Heights[t]; // на текущей позиции добавляем максимальную высоту строки, а не высоту элемента

        var dist = this.findDistance();
        pos.x += dist.w + align.x;
        pos.y += dist.h + align.y;

        return pos;

    },
    findDistance: function()
    {
        return {w : this.dW*this.CurPos_Y, h: this.dH*this.CurPos_X  };
    },
    hidePlaceholder: function(flag)
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
                this.elements[i][j].hidePlaceholder(flag);
    },
     // ф-ия используется, для того чтобы добавить в контент элемента текст/др формулы
    getElement: function(x, y)
    {
     return this.elements[x][y];
    },
    setTxtPrp: function(txtPrp)
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
                if(!this.elements[i][j].IsJustDraw())
                    this.elements[i][j].setTxtPrp(txtPrp);
    }
}


function old_CMathBase(countRow, countCol)
{
    // {align: {height: alpha, width: betta}}  alpha & betta коэффициенты в интервале от 0 до 1, либо CENTER

    CENTER = -1;

    this.pos = null;
    this.size = null;

    this.params = null;

    this.CurPos_X = 0;
    this.CurPos_Y = 0;
    this.empty = false;
    this.SUBCONTENT = true;

    this.nRow = countRow;
    this.nCol = countCol;

    //todo
    //переделать
    this.bMObjs = false;

    this.elements = new Array();
    for(var i=0; i < this.nRow; i++)
        this.elements[i] = new Array();

    this.dW = 0; //column gap, gap width
    this.dH = 0; //row gap, gap height

    this.alignment = {hgt: [], wdt: []};

    for(var u = 0; u < this.nCol ; u++)
        this.alignment.hgt[u] = CENTER;

    for(u=0; u < this.nRow; u++)
        this.alignment.wdt[u] = CENTER;

    this.Parent = null;

    return this;
}

old_CMathBase.prototype =
{
    add: function(code)
    {
        this.elements[this.CurPos_X][this.CurPos_Y].add(code);
        this.recalculateSize();
    },
    add_mathComponent: function(ind)
    {
        this.elements[this.CurPos_X][this.CurPos_Y].add_mathComponent(ind);
        this.recalculateSize();
    },
    init: function(params)
    {
        this.params = Common_CopyObj(params);
    },
    fillPlaceholders: function()
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
            {
                this.elements[i][j] = new CMathContent();
                this.elements[i][j].init(this.params);
                this.elements[i][j].relate(this);
                this.elements[i][j].fillPlaceholders();
            }

        this.setDistance();
        this.recalculateSize();

    },
    // oO
    //TODO
    // переделать
    setPlaceholder:  function(pos, params)
    {
        this.elements[pos.x][pos.y] = new CMathContent();
        this.elements[pos.x][pos.y].init(params);
        this.elements[pos.x][pos.y].relate(this);
        this.elements[pos.x][pos.y].fillPlaceholders();
    },
    setContent: function()
    {
        if(arguments.length == this.nRow*this.nCol)
        {
            for(var i = 0; i < this.nRow; i++)
                for(var j = 0; j < this.nCol; j++)
                {
                    this.elements[i][j] = arguments[j + i*this.nCol];
                    this.elements[i][j].relate(this);
                    this.elements[i][j].bMObjs = true;
                }
            this.setDistance();
            this.recalculateSize();
        }
        else
            this.fillPlaceholders();
    },
    relate: function(parent)
    {
        this.Parent = parent;
    },
    //TODO
    //переделать
    modify: function(pos, elem)
    {
        this.elements[pos.x][pos.y] = elem;
        this.elements[pos.x][pos.y].relate(this); //это строчка здесь просто так, т.к. пока меняем только контент на символ
        this.recalculateSize();
    },
    cursor_moveLeft: function()
    {
        var bUpperLevel = false;
        //var oldPos = {x: this.CurPos_X, y: this.CurPos_Y}; //старая позиция нужна когда  только в случае если находимся в базовом контенте, а здесь нет, т.к. всегда есть родитель

        do{
            if( this.CurPos_Y > 0  )
            {
                this.CurPos_Y--;
            }
            else if(this.CurPos_X > 0)
            {
                this.CurPos_X--;
                this.CurPos_Y = this.nCol - 1;
            }
            else
            {
                bUpperLevel = true;
                break;
            }
        } while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )

        //из цикла вышли если bJustDraw = false  or  bUpperLevel = true

        var content;
        if(bUpperLevel)
        {
            var movement = this.Parent.cursor_moveLeft();
            content = movement.SelectContent;
        }
        else
        {
            this.elements[ this.CurPos_X ][ this.CurPos_Y].end();
            content = this.elements[this.CurPos_X][this.CurPos_Y].goToLastElement(); //если внутренний элемент не контент, а базовый класс, вернется последний элемент этого класса
        }

        return { SelectContent: content };
    },
    cursor_moveRight: function()
    {
        var bUpperLevel = false;

        do{
            if( this.CurPos_Y < this.nCol - 1 )
            {
                this.CurPos_Y++;
            }
            else if(this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
                this.CurPos_Y = 0;
            }
            else
            {
                bUpperLevel = true;
                break;
            }
        } while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )

        var content;
        if( bUpperLevel )
        {
            var movement = this.Parent.cursor_moveRight();
            content = movement.SelectContent;
        }
        else
        {
            this.elements[ this.CurPos_X ][ this.CurPos_Y ].home();
            content = this.elements[this.CurPos_X][this.CurPos_Y].goToFirstElement();
        } //если внутренний элемент не контент, а базовый класс, вернется первый элемент этого класса

        return { SelectContent: content };
    },
    // эта функция здесь необходима для случая с n-арными операторами : когда передаем n-арный оператор с итераторами и аргумент
    IsJustDraw: function()
    {
        return false;
    },
    select_moveRight: function()
    {
        var res = this.elements[this.CurPos_X][this.CurPos_Y].select_moveRight();

        return res;
    },
    select_moveLeft: function()
    {
        var res = this.elements[this.CurPos_X][this.CurPos_Y].select_moveLeft();

        return res;
    },
    goToLastElement: function()
    {
        this.CurPos_X = this.nRow - 1;
        this.CurPos_Y = this.nCol - 1;
        while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )
        {
            if( this.CurPos_Y > 0)
            {
                this.CurPos_Y--;
            }
            else if(this.CurPos_X > 0)
            {
                this.CurPos_X--;
                this.CurPos_Y = this.nCol - 1;
            }
        }

        this.elements[this.CurPos_X][this.CurPos_Y].end();

        return this.elements[this.CurPos_X][this.CurPos_Y].goToLastElement();
    },
    goToFirstElement: function()
    {
        this.CurPos_X = 0;
        this.CurPos_Y = 0;
        while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )
        {
            if( this.CurPos_Y < this.nCol - 1 )
            {
                this.CurPos_Y++;
            }
            else if(this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
                this.CurPos_Y = 0;
            }
        }

        this.elements[this.CurPos_X][this.CurPos_Y].home();

        return this.elements[this.CurPos_X][this.CurPos_Y].goToFirstElement();
    },
    // TODO
    // пересмотреть логику
    // TODO
    // пересомтреть this.gaps / this.dW
    // остановиться на чем-нибудь одном
    goToUpperLevel: function(coord)
    {
        //пришли из текущего контента

        var state = false, bUp = false, content = null;
        var alignPrev = this.align(this.CurPos_X, this.CurPos_Y);

        var crd = {x: coord.x + alignPrev.x, y: coord.y};

        if( this.CurPos_X > 0 )
        {
            this.CurPos_X--;
            while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() &&  this.CurPos_X > 0)
            {
                this.CurPos_X--;
            }
            if( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() ) // все элементы только для отрисовки и дошли до конца
            {
                this.CurPos_X = prevPos.x;
                state = false;
            }
            else
                state = true;
        }

        if( state )
        {
            bUp = true;
            var size = this.elements[this.CurPos_X][this.CurPos_Y].size;
            var alignCurr = this.align(this.CurPos_X, this.CurPos_Y);
            crd.y = size.height;

            if( crd.x < alignCurr.x )
                crd.x = 0;
            else if( crd.x > alignCurr.x + size.width )
                crd.x = size.width;
            else
                crd.x = crd.x - alignCurr.x;
            content = this.elements[this.CurPos_X][this.CurPos_Y].afterDisplacement(crd);

        }
        else
        {
            var maxWH = this.getWidthsHeights();
            var widthToEl = 0;
            for(var j = 0; j < this.CurPos_Y; j++)
                widthToEl += maxWH.widths[j] + this.dW;
            //widthToEl += maxWH.widths[j] + this.gaps.column[j+1];

            crd.x += widthToEl;
            var upLevel = this.Parent.goToUpperLevel(crd);
            bUp = upLevel.bUp;
            if(bUp)
                content = upLevel.content;
            else
                content = null;
        }

        return {bUp: bUp, content: content};

    },
    // TODO
    // пересмотреть логику
    goToLowerLevel: function(coord)
    {
        var state = false, bLow = false, content = null;
        var alignPrev = this.align(this.CurPos_X, this.CurPos_Y);

        var crd = {x: coord.x + alignPrev.x, y: coord.y};

        if( this.CurPos_X < this.nRow - 1 )
        {
            this.CurPos_X++;
            while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() && this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
            }
            if( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() ) // все элементы только для отрисовки и дошли до конца
            {
                this.CurPos_X = prevPos.x;
                state = false;
            }
            else
                state = true;
        }

        if( state )
        {
            bLow = true;
            var size = this.elements[this.CurPos_X][this.CurPos_Y].size;
            var alignCurr = this.align(this.CurPos_X, this.CurPos_Y);
            crd.y = 0;

            if( crd.x < alignCurr.x )
                crd.x = 0;
            else if( crd.x > alignCurr.x + size.width )
                crd.x = size.width;
            else
                crd.x = crd.x - alignCurr.x;
            content = this.elements[this.CurPos_X][this.CurPos_Y].afterDisplacement(crd);
        }
        else
        {
            var maxWH = this.getWidthsHeights();
            var widthToEl = 0;
            for(var j = 0; j < this.CurPos_Y; j++)
                widthToEl += maxWH.widths[j] + this.dW;
            //widthToEl += maxWH.widths[j] + this.gaps.column[j+1];

            crd.x += widthToEl;
            var lowLevel = this.Parent.goToLowerLevel(crd);
            bLow = lowLevel.bLow;

            if(bLow)
                content = lowLevel.content;
            else
                content = null;

        }

        return {bLow: bLow, content: content};
    },
    afterDisplacement: function(coord) //аналог mouseDown
    {
        var disp = this.findDisposition(coord);
        this.CurPos_X = disp.pos.x;
        this.CurPos_Y = disp.pos.y;

        var content = this.elements[this.CurPos_X][this.CurPos_Y].afterDisplacement(disp.mCoord);

        return content;
    },
    drawSelect: function()
    {
        this.elements[this.CurPos_X][this.CurPos_Y].drawSelect();
    },
    home: function()
    {
        this.CurPos_X = 0;
        this.CurPos_Y = 0;
        while(this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw())
        {
            if( this.CurPos_Y < this.nCol - 1 )
            {
                this.CurPos_Y++;
            }
            else if(this.CurPos_X < this.nRow - 1)
            {
                this.CurPos_X++;
                this.CurPos_Y = 0;
            }
        }

        this.elements[this.CurPos_X][this.CurPos_Y].home();
    },
    end: function()
    {
        this.CurPos_X = this.nRow - 1;
        this.CurPos_Y = this.nCol - 1;
        while( this.elements[this.CurPos_X][this.CurPos_Y].IsJustDraw() )
        {
            if( this.CurPos_Y > 0)
            {
                this.CurPos_Y--;
            }
            else if(this.CurPos_X > 0)
            {
                this.CurPos_X--;
                this.CurPos_Y = this.nCol - 1;
            }
        }

        this.elements[this.CurPos_X][this.CurPos_Y].end();

    },
    mouseUp: function()
    {
        this.elements[this.CurPos_X][this.CurPos_Y].mouseUp();
    },
    getWidthsHeights: function()
    {
        var Widths = [];
        for(var tt = 0; tt < this.nCol; tt++ )
            Widths[tt] = 0;

        var Ascents = [];
        var Descents = [];

        for(tt = 0; tt < this.nRow; tt++ )
        {
            Ascents[tt] = 0;
            Descents[tt] = 0;
        }

        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol ; j++)
            {
                var size = this.elements[i][j].size;
                Widths[j] = ( Widths[j] > size.width ) ? Widths[j] : size.width;
                Ascents[i] = (Ascents[i] > size.center ) ? Ascents[i] : size.center;
                Descents[i] = (Descents[i] > size.height - size.center ) ? Descents[i] : size.height - size.center;
            }

        var Heights = [];
        for(tt = 0; tt < this.nRow; tt++ )
        {
            Heights[tt] = Ascents[tt] + Descents[tt];
        }

        return { widths: Widths, heights: Heights };
    },
    mouseDown: function( mCoord)
    {
        var elem = this.findDisposition( mCoord);

        this.CurPos_X = elem.pos.x;
        this.CurPos_Y = elem.pos.y;

        var res = this.elements[this.CurPos_X][this.CurPos_Y].mouseDown( elem.mCoord, elem.inside_flag );

        return res;

    },
    mouseMove: function( mCoord )
    {
        var state = true, SelectContent = null;
        var elem = this.findDisposition( mCoord);

        if(elem.pos.x == this.CurPos_X && elem.pos.y == this.CurPos_Y && elem.inside_flag === -1 )
        {
            var movement = this.elements[this.CurPos_X][this.CurPos_Y].mouseMove( elem.mCoord );
            SelectContent = movement.SelectContent;
            state = true;
        }
        else
            state = false;

        return {state: state, SelectContent: SelectContent};

    },
    old_align: function(pos_x, pos_y)
    {
        var _x;
        var _y;

        if(this.alignment.hgt[pos_x] == CENTER)
        {
            var maxC = 0;

            for(var j = 0; j < this.nCol; j++)
            {
                _c = this.elements[pos_x][j].size.center;
                maxC = ( maxC > _c ) ? maxC : _c;
            }
            _y = (maxC - this.elements[pos_x][pos_y].size.center);
        }
        else
        {
            var maxH = 0;

            for(j=0; j < this.nCol; j++)
            {
                _h = this.elements[pos_x][j].size.height;
                maxH = ( maxH > _h ) ? maxH : _h;
            }
            _y = (maxH - this.elements[pos_x][pos_y].size.height)*this.alignment.hgt[pos_x];
        }

        var maxW  = 0;
        for(var i=0; i < this.nRow; i++)
        {
            var _w = this.elements[i][pos_y].size.width;
            maxW = ( maxW > _w ) ? maxW : _w;
        }

        if(this.alignment.wdt[pos_y] == CENTER)
            _x = (maxW - this.elements[pos_x][pos_y].size.width)*0.5;
        else
            _x = (maxW - this.elements[pos_x][pos_y].size.width)*this.alignment.wdt[pos_y];

        return {x: _x, y: _y};
    },
    align: function(pos_x, pos_y)
    {
        var _x;
        var _y;

        if(this.alignment.hgt[pos_y] == CENTER)
        {
            var maxC = 0;

            for(var j = 0; j < this.nCol; j++)
            {
                _c = this.elements[pos_x][j].size.center;
                maxC = ( maxC > _c ) ? maxC : _c;
            }
            _y = (maxC - this.elements[pos_x][pos_y].size.center);
        }
        else
        {
            var maxH = 0;

            for(j=0; j < this.nCol; j++)
            {
                _h = this.elements[pos_x][j].size.height;
                maxH = ( maxH > _h ) ? maxH : _h;
            }
            _y = (maxH - this.elements[pos_x][pos_y].size.height)*this.alignment.hgt[pos_y];
        }

        var maxW  = 0;
        for(var i=0; i < this.nRow; i++)
        {
            var _w = this.elements[i][pos_y].size.width;
            maxW = ( maxW > _w ) ? maxW : _w;
        }

        if(this.alignment.wdt[pos_x] == CENTER)
            _x = (maxW - this.elements[pos_x][pos_y].size.width)*0.5;
        else
            _x = (maxW - this.elements[pos_x][pos_y].size.width)*this.alignment.wdt[pos_x];

        return {x: _x, y: _y};
    },
    old_findDisposition: function(mCoord)
    {
        var mouseCoord = {x: null, y: null},
            posCurs =    {x: null, y: null};

        var sumWidth = 0;
        var sumHeight = 0;

        var maxWH = this.getWidthsHeights();

        var Widths = maxWH.widths;
        var Heights = maxWH.heights;

        ///////////////////////////////

        if(mCoord.y > this.size.height)
            posCurs.x = this.nRow - 1;
        else
        {
            var _h = 0;
            for(var j = 0; j < this.nRow; j++)
            {
                _h += Heights[j];
                _h += this.dH/2;
                if( mCoord.y <= _h )
                {
                    posCurs.x = j;
                    break;
                }
                _h += this.dH/2;
            }
        }

        ///////////////////////////////

        //если не правильно посчитали, а элемент был justDraw, то будет ошибка

        if( mCoord.x > this.size.width )
            posCurs.y = this.nCol - 1;
        else
        {
            var _w = 0;
            for(var u = 0; u < this.nCol; u++)
            {
                _w +=Widths[u];
                _w += this.dW/2;
                if( mCoord.x <= _w )
                {

                    if( this.elements[posCurs.x][u].IsJustDraw() )
                    {
                        if(this.nRow > 1)
                        {
                            if(posCurs.x == 0)
                                posCurs.x = 1;
                            else if(posCurs.x == this.nRow - 1)
                                posCurs.x = this.nRow - 2;
                            else
                            {
                                if( mCoord.y < (_h - Heights[posCurs.x]/2) )
                                    posCurs.x--;
                                else
                                    posCurs.x++;
                            }
                            posCurs.y = u;
                        }
                        else if(this.nCol > 1)
                        {
                            if(u == 0)
                                posCurs.y = 1;
                            else if(u == this.nCol - 1)
                                posCurs.y = this.nCol - 2;
                            else
                            {
                                if( mCoord.x < (_w - Widths[u]/2) )
                                    posCurs.y = u - 1;
                                else
                                    posCurs.y = u + 1;
                            }

                        }
                        else
                            return; // не самое лучшее решение, в идеале если у нас если такая ситуация получилась
                        // (что сомнительно, в контенте один элемент с которым ничего нельзя сделать),
                        // то вставать  после этого элемента  в контенте на уровень выше
                        // лучше следить за подобными ситуациями, чтобы такого не было
                    }
                    else
                        posCurs.y = u;
                    break;
                }
                _w += this.dW/2;
            }
        }
        ////////////////////////////////

        for(var t = 0; t < posCurs.y; t++)
            sumWidth += Widths[t];
        for(t = 0; t < posCurs.x; t++)
            sumHeight += Heights[t];

        // флаг для случая, когда выходим за границы элемента и есть выравнивание относительно других элементов
        var flag = true;

        if( posCurs.x != null && posCurs.y != null)
        {
            var size = this.elements[posCurs.x][posCurs.y].size;
            var align = this.align(posCurs.x, posCurs.y);
            if(mCoord.x < ( posCurs.y*this.dW + sumWidth + align.x ))
            {
                mouseCoord.x = 0;
                flag = false;
            }
            else if( mCoord.x > ( posCurs.y*this.dW + sumWidth + align.x + size.width ))
            {
                mouseCoord.x = size.width;
                flag = false;
            }
            else
                mouseCoord.x = mCoord.x - ( posCurs.y*this.dW + sumWidth + align.x );


            if(mCoord.y < (posCurs.x*this.dH + sumHeight + align.y))
                mouseCoord.y = 0;
            else if( mCoord.y > ( posCurs.x*this.dH + sumHeight + align.y + size.height ) )
                mouseCoord.y = size.height;
            else
                mouseCoord.y = mCoord.y - (posCurs.x*this.dH + sumHeight + align.y );
        }

        return {pos: posCurs, mCoord: mouseCoord, flag: flag};
    },
    findDisposition: function(mCoord)
    {
        var mouseCoord = {x: null, y: null},
            posCurs =    {x: null, y: null};


        var sumWidth = 0;
        var sumHeight = 0;

        var maxWH = this.getWidthsHeights();

        var Widths = maxWH.widths;
        var Heights = maxWH.heights;

        ///////////////////////////////

        if(mCoord.y > this.size.height)
            posCurs.x = this.nRow - 1;
        else
        {
            var _h = 0;
            for(var j = 0; j < this.nRow; j++)
            {
                _h += Heights[j];
                _h += this.dH/2;
                if( mCoord.y <= _h )
                {
                    posCurs.x = j;
                    break;
                }
                _h += this.dH/2;
            }
        }

        ///////////////////////////////

        //если не правильно посчитали, а элемент был justDraw, то будет ошибка

        if( mCoord.x > this.size.width )
            posCurs.y = this.nCol - 1;
        else
        {
            var _w = 0;
            for(var u = 0; u < this.nCol; u++)
            {
                _w +=Widths[u];
                _w += this.dW/2;
                if( mCoord.x <= _w )
                {

                    if( this.elements[posCurs.x][u].IsJustDraw() )
                    {
                        if(this.nRow > 1)
                        {
                            if(posCurs.x == 0)
                                posCurs.x = 1;
                            else if(posCurs.x == this.nRow - 1)
                                posCurs.x = this.nRow - 2;
                            else
                            {
                                if( mCoord.y < (_h - Heights[posCurs.x]/2) )
                                    posCurs.x--;
                                else
                                    posCurs.x++;
                            }
                            posCurs.y = u;
                        }
                        else if(this.nCol > 1)
                        {
                            if(u == 0)
                                posCurs.y = 1;
                            else if(u == this.nCol - 1)
                                posCurs.y = this.nCol - 2;
                            else
                            {
                                if( mCoord.x < (_w - Widths[u]/2) )
                                    posCurs.y = u - 1;
                                else
                                    posCurs.y = u + 1;
                            }

                        }
                        else
                            return; // не самое лучшее решение, в идеале если у нас если такая ситуация получилась
                        // (что сомнительно, в контенте один элемент с которым ничего нельзя сделать),
                        // то вставать  после этого элемента  в контенте на уровень выше
                        // лучше следить за подобными ситуациями, чтобы такого не было
                    }
                    else
                        posCurs.y = u;
                    break;
                }
                _w += this.dW/2;
            }
        }
        ////////////////////////////////

        for(var t = 0; t < posCurs.y; t++)
            sumWidth += Widths[t];
        for(t = 0; t < posCurs.x; t++)
            sumHeight += Heights[t];

        // флаг для случая, когда выходим за границы элемента и есть выравнивание относительно других элементов
        // -1 - в пределах границы
        // 0 - начало контента
        // 1 - конец контента
        // 2 - выщли за границы контента по Y

        var inside_flag = -1;

        if( posCurs.x != null && posCurs.y != null)
        {
            var size = this.elements[posCurs.x][posCurs.y].size;
            var align = this.align(posCurs.x, posCurs.y);
            if(mCoord.x < ( posCurs.y*this.dW + sumWidth + align.x ))
            {
                mouseCoord.x = 0;
                inside_flag = 0;
            }
            else if( mCoord.x > ( posCurs.y*this.dW + sumWidth + align.x + size.width ))
            {
                mouseCoord.x = size.width;
                inside_flag = 1;
            }
            else
                mouseCoord.x = mCoord.x - ( posCurs.y*this.dW + sumWidth + align.x );


            if(mCoord.y < (posCurs.x*this.dH + sumHeight + align.y))
            {
                mouseCoord.y = 0;
                inside_flag = 2;
            }
            else if( mCoord.y > ( posCurs.x*this.dH + sumHeight + align.y + size.height ) )
            {
                mouseCoord.y = size.height;
                inside_flag = 2;
            }
            else
                mouseCoord.y = mCoord.y - (posCurs.x*this.dH + sumHeight + align.y );
        }

        return {pos: posCurs, mCoord: mouseCoord, inside_flag: inside_flag};
    },
    setPosition: function(pos)
    {
        if(this.bMObjs === true)
            this.pos = pos;
        else
            this.pos = {x: pos.x, y: pos.y - this.size.center}; ///!!!!!!!!!!!!!!!!!!!!!!!!!!

        var maxWH = this.getWidthsHeights();
        var Widths = maxWH.widths;
        var Heights = maxWH.heights;

        var h = 0, w = 0;
        for(var i=0; i < this.nRow; i++)
        {
            w = 0;
            for(var j = 0; j < this.nCol; j++)
            {
                var al = this.align(i, j);
                this.elements[i][j].setPosition( {x: this.pos.x + al.x + this.dW*j + w , y: this.pos.y + al.y + this.dH*i + h  } );
                w += Widths[j];
            }
            h += Heights[i];
        }
    },
    draw: function()
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
                this.elements[i][j].draw();
    },
    remove: function()
    {
        return this.Parent.remove();
    },
    recalculateSize: function()
    {
        var _width = 0;
        var _height = 0;

        var maxWH = this.getWidthsHeights();

        var Widths = maxWH.widths;
        var Heights = maxWH.heights;

        for( j = 0 ; j < this.nRow; j++ )
            _height += Heights[j];

        _height += this.dH*(this.nRow - 1);

        for( i=0; i < this.nCol ; i++)
            _width += Widths[i];

        _width += this.dW*(this.nCol - 1);

        var _center =  this.getCenter(_height);

        this.size = {width: _width, height: _height, center: _center};
    },
    ResizeReverse: function()
    {
        this.recalculateSize();
        this.Parent.ResizeReverse();
    },
    ResizeReverse_2: function() //for finished equation
    {
        this.ResizeDirect();

        this.Parent.ResizeReverse();
    },
    ResizeDirect: function()
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
            {
                if(! this.elements[i][j].IsJustDraw() )
                    this.elements[i][j].ResizeDirect();
            }

        this.recalculateSize();
    },
    getCenter: function(_height)
    {
        var res = 0;
        if(this.nRow > 1)
        {
            res = _height || this.size.height;
            res /=2;
        }
        else
            for(var i=0; i< this.nCol; i++)
                res = (this.elements[0][i].size.center > res) ?  this.elements[0][i].size.center : res;

        return res;
    },
    setFont: function(font)
    {
        this.params.font = font;
        this.setDistance(); //выставляем gaps

        for(var i=0; i < this.nRow; i++)
            for(var j=0; j < this.nCol; j++)
                this.elements[i][j].setFont(font);


        this.recalculateSize();
    },
    alignHor: function(pos, coeff)
    {
        if(pos!=-1)
            this.alignment.wdt[pos] = coeff;
        else
            for(var j = 0; j< this.alignment.wdt.length; j++)
                this.alignment.wdt[j] = coeff;

    },
    alignVer: function(pos, coeff)
    {
        if(pos!=-1)
            this.alignment.hgt[pos] = coeff;
        else
            for(var j = 0; j < this.alignment.hgt.length; j++)
                this.alignment.hgt[j] = coeff;
    },
    setDistance: function()
    {

    },
    getPosTwTarget: function()
    {
        var pos = this.elements[this.CurPos_X][this.CurPos_Y].getPosTwTarget();
        var align = this.align(this.CurPos_X, this.CurPos_Y);

        var maxWH = this.getWidthsHeights();
        var Heights = maxWH.heights,
            Widths = maxWH.widths;

        for(var t = 0; t < this.CurPos_Y; t++)
            pos.x += Widths[t];


        for(var t = 0; t < this.CurPos_X; t++)
            pos.y += Heights[t]; // на текущей позиции добавляем максимальную высоту строки, а не высоту элемента

        var dist = this.findDistance();
        pos.x += dist.w + align.x;
        pos.y += dist.h + align.y;

        return pos;

    },
    findDistance: function()
    {
        return {w : this.dW*this.CurPos_Y, h: this.dH*this.CurPos_X  };
    },
    IsHighElement: function()
    {
        return true;
    },
    old_updateTextPrp: function(TextPrp)
    {
        this.params.font = TextPrp;
        this.elements[this.CurPos_X][this.CurPos_Y].updateTextPrp(TextPrp);
    },
    IsIncline: function()
    {
        return false;
    },
    gToUp: function()
    {
        this.recalculateSize();
        return this.Parent;
    },
    hidePlaceholder: function(flag)
    {
        for(var i=0; i < this.nRow; i++)
            for(var j = 0; j < this.nCol; j++)
                this.elements[i][j].hidePlaceholder(flag);
    },
    getElement: function(x, y)
    {
        return this.elements[x][y];
    }
}