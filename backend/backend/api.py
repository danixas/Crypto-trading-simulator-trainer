from ninja import NinjaAPI
from users.views import users_router
from crypto.views import crypto_router
from crypto.views import auth_crypto_router
from strategies.views import strategy_router

api = NinjaAPI(title="Crypto App")

# Adding all the routers of different django-apps
api.add_router('/users/', users_router)
api.add_router('/crypto/', crypto_router)
api.add_router('/crypto/auth/', auth_crypto_router)
api.add_router('/strategies/', strategy_router)
