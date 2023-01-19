from setuptools import setup, find_packages

with open('README.rst') as f:
    readme = f.read()

with open('LICENSE') as f:
    license = f.read()

# Copy dependencies
with open('requirements.txt') as f:
    requirements = f.read().splitlines()

version = (
    open("proposal/__init__.py")
    .read()
    .split("__version__ = ")[-1]
    .split("\n")[0]
    .strip("")
    .strip("'")
    .strip('"')
)

setup(
    name='proposal',
    version=version,
    description='Proposal generator for a product presentation',
    long_description=readme,
    author='Vladislav Voitenok',
    author_email='vleduser@gmail.com',
    url='https://github.com/vled12/proposal',
    license=license,
    include_package_data=True,
    packages=find_packages(exclude=('tests', 'docs')),
    install_requires=requirements
)
