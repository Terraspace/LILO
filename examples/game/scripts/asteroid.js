    function Asteroid()
        {
            
            this.texture      = new Lilo.Texture( "gfx/meteor2.jpg", Lilo.Engine._glCtx.LINEAR, Lilo.Engine._glCtx.LINEAR );
            this.rotation     = 0.0;
            this.scale        = 0.2;
            this.position     = [ 0.0, 0.0 ];
            this.velocity     = [ 0.0, 0.0 ];
            this.acceleration = [ 0.0, 0.0 ];
            this.program      = null;
            this.vshader      = null;
            this.fshader      = null;

            this.vshadersrc = ' \n\
                // an attribute will receive data from a buffer \n\
                attribute vec2 a_position; \n\
                attribute vec2 a_texCoord; \n\
                \n\
                uniform mat3 u_matrix; \n\
                varying vec2 v_texCoord; \n\
                \n\
                // all shaders have a main function \n\
                void main() { \n\
                    \n\
                    // Pass the texCoord to the fragment shader \n\
                    // The GPU will interpolate this value between points \n\
                    v_texCoord = a_texCoord; \n\
                    \n\
                    // gl_Position is a special variable a vertex shader is responsible for setting \n\
                    vec2 aspectScale = vec2(1.0, 1.95); \n\
                    vec2 position = (u_matrix * vec3(a_position, 1)).xy; \n\
                    position = position * aspectScale; \n\
                    gl_Position = vec4(position, 0, 1); \n\
                    \n\
                }';

            this.fshadersrc = ' \n\
                precision mediump float; \n\
                \n\
                // our texture \n\
                uniform sampler2D u_image; \n\
                \n\
                // the texCoords passed in from the vertex shader. \n\
                varying vec2 v_texCoord; \n\
                \n\
                void main() { \n\
                    // Look up a color from the texture. \n\
                    gl_FragColor = texture2D(u_image, v_texCoord); \n\
                }';

            this.positionAttributeLocation = null;
            this.positionBuffer            = null;
            this.texCoordLocation          = null;
            this.texCoordBuffer            = null;
            this.matrixLocation            = null;

            this.Init = function( )
            {
                this.vshader = Lilo.Engine.CreateShader( Lilo.Engine._glCtx.VERTEX_SHADER, this.vshadersrc );
                this.fshader = Lilo.Engine.CreateShader( Lilo.Engine._glCtx.FRAGMENT_SHADER, this.fshadersrc );
                this.program = Lilo.Engine.CreateProgram( this.vshader, this.fshader );
                
                this.positionAttributeLocation = Lilo.Engine._glCtx.getAttribLocation( this.program, "a_position" );
                this.texCoordLocation          = Lilo.Engine._glCtx.getAttribLocation( this.program, "a_texCoord" );
                this.matrixLocation            = Lilo.Engine._glCtx.getUniformLocation( this.program, "u_matrix" );

                this.positionBuffer            = Lilo.Engine._glCtx.createBuffer();
                this.texCoordBuffer            = Lilo.Engine._glCtx.createBuffer();

                Lilo.Engine._glCtx.bindBuffer( Lilo.Engine._glCtx.ARRAY_BUFFER, this.positionBuffer );
                var positions = [
                    -1.0,  1.0,
                    -1.0, -1.0,
                     1.0, -1.0,
                    -1.0,  1.0,
                     1.0, -1.0,
                     1.0,  1.0
                ];
                Lilo.Engine._glCtx.bufferData( Lilo.Engine._glCtx.ARRAY_BUFFER, new Float32Array( positions ), Lilo.Engine._glCtx.STATIC_DRAW );
                
                Lilo.Engine._glCtx.bindBuffer( Lilo.Engine._glCtx.ARRAY_BUFFER, this.texCoordBuffer );
                Lilo.Engine._glCtx.bufferData( Lilo.Engine._glCtx.ARRAY_BUFFER, new Float32Array([
                    0.0,  0.0,
                    0.0,  1.0,
                    1.0,  1.0,
                    0.0,  0.0,
                    1.0,  1.0,
                    1.0,  0.0]), Lilo.Engine._glCtx.STATIC_DRAW );
            }
 
            this.Update = function()
            {
                this.rotation += 1.1;
            }

            this.Render = function( ctx )
            {
                var translationMatrix = UE.Geometry.m3.translation( this.position[0], this.position[1] );
                var rotationMatrix = UE.Geometry.m3.rotation( UE.Geometry.Deg2Rad( this.rotation ) );
                var scaleMatrix = UE.Geometry.m3.scaling( this.scale, this.scale );
                var matrix = UE.Geometry.m3.multiply( translationMatrix, rotationMatrix );
                matrix = UE.Geometry.m3.multiply( matrix, scaleMatrix );
 
                ctx.blendFunc( ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA );
                ctx.enable( ctx.BLEND );
                ctx.useProgram( this.program );

                // Set the matrix.
                ctx.uniformMatrix3fv( this.matrixLocation, false, matrix );

                ctx.enableVertexAttribArray( this.positionAttributeLocation );
                ctx.bindBuffer( ctx.ARRAY_BUFFER, this.positionBuffer ); // Bind the position buffer.
                // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
                var size = 2;          // 2 components per iteration
                var type = ctx.FLOAT;  // the data is 32bit floats
                var normalize = false; // don't normalize the data
                var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                var offset = 0;        // start at the beginning of the buffer
                ctx.vertexAttribPointer( this.positionAttributeLocation, size, type, normalize, stride, offset );

                ctx.enableVertexAttribArray( this.texCoordLocation );
                ctx.bindBuffer( ctx.ARRAY_BUFFER, this.texCoordBuffer );
                ctx.vertexAttribPointer( this.texCoordLocation, 2, ctx.FLOAT, false, 0, 0 );
                
                ctx.activeTexture( ctx.TEXTURE0 );
                ctx.bindTexture( ctx.TEXTURE_2D, this.texture._glTexture );

                var primitiveType = ctx.TRIANGLES;
                var offset = 0;
                var count = 6;
                ctx.drawArrays( primitiveType, offset, count );
            }

        }