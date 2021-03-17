class AstroController < ApplicationController

  def index
    @app = "windows"
  end

  def sun
    @app = "sun"
    render :index
  end

  def moon
    @app = "moon"
    render :index
  end

end
