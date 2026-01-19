"""
Setup script for Lingshu package
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="lingshu",
    version="0.1.0",
    author="guangzede",
    description="灵枢百宝箱 - 五运六气、天干地支、八字排盘、股市预测系统",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/guangzede/lingshu",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.7",
    keywords="中医 八字 五行 天干地支 股市预测 traditional-chinese-medicine bazi wuxing",
)
