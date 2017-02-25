var UE = UE || {};
UE.Geometry = UE.Geometry || {};

UE.Geometry.Vertex = function( x, y, z ) {
    this.x = x;
    this.y = y;
    this.z = z;
}

UE.Geometry.Vector = function( x, y, z ) {
    this.x = x;
    this.y = y;
    this.z = z;
}
UE.Geometry.Vector.prototype = {

    constructor : UE.Geometry.Vector,

    Normalize : function()
    {
        var imag = 1.0 / (this.Magnitude() == 0) ? 0.001 : this.Magnitude();
        this.x *= imag;
        this.y *= imag;
    },

    Dot : function( v )
    {
        return( (this.x * v.x) + (this.y * v.y) );
    },

    Magnitude : function()
    {
        return( Math.sqrt( (this.x*this.x) + (this.y*this.y) ) );
    },

    Scale : function( s )
    {
        this.x *= s;
        this.y *= s;
    },

    Add : function( v )
    {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
    },

    ScalarMul : function( s )
    {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }
};

UE.Geometry.Vector.Reflect = function( i, n )
{
    // I - 2.0 * dot(N, I) * N.
    var d = n.Dot( i );
    return new UE.Geometry.Vector( i.x - 2 * d * n.x, i.y - 2 * d * n.y );
}

UE.Geometry.Vector.CrossProduct = function( v1, v2 ) {
    return( (v1.x*v2.y) - (v1.y*v2.x) );
}

UE.Geometry.Vector.Perpendicular = function( vIn ) {
    var vOut = new UE.Geometry.Vector( vIn.y, -vIn.x );
    vOut.Normalize();
    return( vOut );
}

UE.Geometry.Deg2Rad = function( ang )
{
    return( ang * Math.PI / 180 );
}

UE.Geometry.Rad2Deg = function( ang )
{
    return( ang * 180 / Math.PI );
}

UE.Geometry.SegIntersects = function (x1,y1,x2,y2,x3,y3,x4,y4) {
    var denom = ((y4-y3)*(x2-x1)) - ((x4-x3)*(y2-y1));
    if(denom == 0.0) return(false); // Lines are parallel.

    var uaN = ((x4-x3)*(y1-y3)) - ((y4-y3)*(x1-x3));
    var ua = uaN / denom;

    var ubN = ((x2-x1)*(y1-y3)) - ((y2-y1)*(x1-x3));
    var ub = ubN / denom;

    if(uaN == 0.0 && ubN == 0.0) return(true); // Lines are coincident.

    if(ua >= 0.01 && ua <= 0.99 && ub >= 0.01 && ub <= 0.99) return(true); // On the reduced segments.

    return(false);
}

UE.Geometry.GetIntersectionPoint = function(x1,y1,x2,y2,x3,y3,x4,y4) {
    var CmP = new UE.Geometry.Vector(x3 - x1, y3 - y1);
    var r = new UE.Geometry.Vector(x2 - x1, y2 - y1);
    var s = new UE.Geometry.Vector(x4 - x3, y4 - y3);

    var CmPxr = UE.Geometry.Vector.CrossProduct(CmP,r);
    var CmPxs = UE.Geometry.Vector.CrossProduct(CmP,s);
    var rxs = UE.Geometry.Vector.CrossProduct(r,s);

    if (Math.abs(CmPxr) < 0.00001)
    {
        var a = [];
        a[0] = (x1-x3)*(x1-x3) + (y1-y3)*(y1-y3);
        a[1] = (x1-x4)*(x1-x4) + (y1-y4)*(y1-y4);
        a[2] = (x2-x3)*(x2-x3) + (y2-y3)*(y2-y3);
        a[3] = (x2-x4)*(x2-x4) + (y2-y4)*(y2-y4);
        if(a[0] < a[1] && a[0] < a[2] && a[0] < a[3]) return(new UE.Geometry.Vertex(x1,y1));
        if(a[1] < a[0] && a[1] < a[2] && a[1] < a[3]) return(new UE.Geometry.Vertex(x1,y1));
        if(a[2] < a[0] && a[2] < a[1] && a[2] < a[3]) return(new UE.Geometry.Vertex(x2,y2));
        if(a[3] < a[0] && a[3] < a[1] && a[3] < a[2]) return(new UE.Geometry.Vertex(x2,y2));
        return new MPX.Geometry.Vertex(0,0); // no overlap.
    }

    if (Math.abs(rxs) < 0.00001)
    {
        var a = [];
        a[0] = (x1-x3)*(x1-x3) + (y1-y3)*(y1-y3);
        a[1] = (x1-x4)*(x1-x4) + (y1-y4)*(y1-y4);
        a[2] = (x2-x3)*(x2-x3) + (y2-y3)*(y2-y3);
        a[3] = (x2-x4)*(x2-x4) + (y2-y4)*(y2-y4);
        if(a[0] < a[1] && a[0] < a[2] && a[0] < a[3]) return(new UE.Geometry.Vertex(x1,y1));
        if(a[1] < a[0] && a[1] < a[2] && a[1] < a[3]) return(new UE.Geometry.Vertex(x1,y1));
        if(a[2] < a[0] && a[2] < a[1] && a[2] < a[3]) return(new UE.Geometry.Vertex(x2,y2));
        if(a[3] < a[0] && a[3] < a[1] && a[3] < a[2]) return(new UE.Geometry.Vertex(x2,y2));
        return new UE.Geometry.Vertex(0,0); // Lines are parallel.
    }

    var rxsr = 1.0 / rxs;
    var t = CmPxs * rxsr;
    var u = CmPxr * rxsr;

    return(new UE.Geometry.Vertex(x1+(t*r.x),y1+(t*r.y)));
}

UE.Geometry.IsLeft = function( a, b, c ) {
    var v = ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x));
    return(v >= 0);
}

UE.Geometry.CCW = function( a, b, c ) {
    return( ( (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) ) );
}

UE.Geometry.Intersect = function( ap, aq, bp, bq ) {
    if (UE.Geometry.CCW(ap, aq, bp) * UE.Geometry.CCW(ap, aq, bq) >= 0) return false;
    if (UE.Geometry.CCW(bp, bq, ap) * UE.Geometry.CCW(bp, bq, aq) >= 0) return false;
    return true;
}

UE.Geometry.PointInPoly = function( vertices, x, y ) {
    var i = 0;
    var c = false;
    if (vertices) {
        var j = vertices.length - 1;
        for (; i < vertices.length; j = i++) {
            if (((vertices[i].y > y) != (vertices[j].y > y)) && (x < (vertices[j].x - vertices[i].x) * (y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x))
                c = !c;
        }
    }
    return(c);
}

UE.Geometry.Sqr = function( x ) { 
    return (x * x);
}

UE.Geometry.Dist2 = function( v, w ) { 
    return ( UE.Geometry.Sqr(v.x - w.x) + UE.Geometry.Sqr(v.y - w.y) ); 
}

UE.Geometry.DistToSegmentSquared = function( p, v, w ) {
    var l2 = UE.Geometry.Dist2(v, w);
    if (l2 == 0) return UE.Geometry.Dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return UE.Geometry.Dist2(p, v);
    if (t > 1) return UE.Geometry.Dist2(p, w);
    return UE.Geometry.Dist2(p, { x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y) });
}

UE.Geometry.DistToSegment = function( p, v, w ) { 
    return (Math.sqrt( UE.Geometry.DistToSegmentSquared(p, v, w) ) ); 
}

UE.Geometry.PointOnSegment = function( p, v, w ) {
    if(v.y == w.y)
    {
        if(p.x >= v.x && p.x <= w.x) return true;
        if(p.x <= v.x && p.x >= w.x) return true;
        return -1;
    }
    if(v.x == w.x)
    {
        if(p.y >= v.y && p.y <= w.y) return true;
        if(p.y <= v.y && p.y >= w.y) return true;
        return -1;
    }
    var l2 = UE.Geometry.Dist2( v, w );
    if (l2 == 0) return false;
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t <= 0) return false;
    if (t >= 1) return false;
    return true;
}

UE.Geometry.PointOnSegmentT = function( p, v, w ) {
    var l2 = UE.Geometry.Dist2( v, w );
    var t = ( (p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y) ) / l2;
    return( t );
}

UE.Geometry.DistanceToLine = function( p, v, w ) {
    if (p == undefined || v == undefined || w == undefined) return(0);
    var ap = new UE.Geometry.Vector( p.x - v.x, p.y - v.y );
    var n  = new UE.Geometry.Vector( w.x - v.x, w.y - v.y );
    n.Normalize();
    var dp = ap.Dot( n );
    n.x *= dp;
    n.y *= dp;
    ap.x -= n.x;
    ap.y -= n.y;
    return( ap.Magnitude() );
}

UE.Geometry.m3 = {

    identity : function()
    {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ];
    },

    projection : function( width, height )
    {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1,
        ];
    },

    project : function( m, width, height ) 
    {
        return UE.Geometry.m3.multiply( m, UE.Geometry.m3.projection( width, height ) );
    },

    translation : function( tx, ty )
    {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
            ];
    },

    translate : function( m, tx, ty ) 
    {
        return UE.Geometry.m3.multiply( m, UE.Geometry.m3.translation( tx, ty ) );
    },

    rotation : function( angle )
    {
        var c = Math.cos( angle );
        var s = Math.sin( angle );
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },

    rotate : function( m, angle )
    {
        return UE.Geometry.m3.multiply (m, UE.Geometry.m3.rotation( angle ) );
    },

    scaling : function( sx, sy ) 
    {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    },

    scale : function( m, sx, sy ) 
    {
        return UE.Geometry.m3.multiply( m, UE.Geometry.m3.scaling( sx, sy ) );
    },

    multiply : function( a, b ) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];

        return [
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,
        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,
        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22,
        ];
    }
}


/*
function distToLine(p,v,w)
{
    if(p == undefined || v == undefined || w == undefined) return(0);
    var ap = new vector2d(p.x- v.x, p.y - v.y);
    var n = new vector2d(w.x- v.x, w.y- v.y);
    n.normalize();
    var dp = dotproduct2D(ap,n);
    n.x *= dp;
    n.y *= dp;
    ap.x -= n.x;
    ap.y -= n.y;
    return(ap.magnitude());
}

function vecReject(a,b)
{
    var v1 = new vector2d(a.x, a.y);
    var c = new vector2d(a.x, a.y);
    var d = new vector2d(b.x, b.y);
    d.normalize();
    var co = dotproduct2D(c,d) / dotproduct2D(d,d);
    d.x *= co;
    d.y *= co;
    v1.x -= d.x;
    v1.y -= d.y;
    return(v1);
}

function vecProject(a,b)
{
    var c = new vector2d(a.x, a.y);
    var d = new vector2d(b.x, b.y);
    d.normalize();
    var co = dotproduct2D(c,d) / dotproduct2D(d,d);
    d.x *= co;
    d.y *= co;
    return(d);
}


function lerp(a,b,t)
{
    var dest = new point(0.0,0.0);
    dest.x = a.x + ((b.x- a.x)*t);
    dest.y = a.y + ((b.y- a.y)*t);
    return(dest);
}

// Draw a bezier curve from pt1 to pt2 with entry tangents t1,t2 in the range t = 0 to 1 segs.
function drawSpline(pt1,pt2,t1,t2,r,g,b,segs)
{
    var t = 0.0;
    var dt = 1.0 / parseFloat(segs);

    var ab = lerp(pt1,t1,t);
    var bc = lerp(t1,t2,t);
    var cd = lerp(t2,pt2,t);
    var aab = lerp(ab,bc,t);
    var ccd = lerp(bc,cd,t);
    var f = lerp(aab,ccd,t);
    var f2 = f;
    for(t=0.0;t<=1.0;t+=dt)
    {
        ab = lerp(pt1,t1,t);
        bc = lerp(t1,t2,t);
        cd = lerp(t2,pt2,t);
        aab = lerp(ab,bc,t);
        ccd = lerp(bc,cd,t);
        f2 = lerp(aab,ccd,t);
        drawLine((f.x|0),(f.y|0),(f2.x|0),(f2.y|0),r,g,b);
        f = f2;
    }
}

function getSplineMidPoint(pt1,pt2,t1,t2)
{
    var t = 0.5;

    var ab = lerp(pt1,t1,t);
    var bc = lerp(t1,t2,t);
    var cd = lerp(t2,pt2,t);
    var aab = lerp(ab,bc,t);
    var ccd = lerp(bc,cd,t);
    var f = lerp(aab,ccd,t);
    return(f);
}

function getSplinePoint(pt1,pt2,t1,t2,t)
{
    var ab = lerp(pt1,t1,t);
    var bc = lerp(t1,t2,t);
    var cd = lerp(t2,pt2,t);
    var aab = lerp(ab,bc,t);
    var ccd = lerp(bc,cd,t);
    var f = lerp(aab,ccd,t);
    return(f);
}

*/