varying vec2 texCoordVarying;

void main()
{
	texCoordVarying = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
