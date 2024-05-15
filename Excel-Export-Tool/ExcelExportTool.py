#! encoding=utf-8
# -*- coding:utf-8 -*-

import xlrd
import xml.dom.minidom
import shutil,os
import sys
import json
reload(sys) # Python2.5 初始化后删除了 sys.setdefaultencoding 方法，我们需要重新载入 
sys.setdefaultencoding('utf-8') 

import re

zh_pattern = re.compile(u'[\u4e00-\u9fa5]+')
configTup=None

def open_excel(file):
    try:
        data = xlrd.open_workbook(file)
        return data
    except Exception, e:
        print str(e)
        
 
def translate_excel_to_xml(excel_absolute_path, name, generate_xml_dir):
	#print( 'translate_excel_to_xml==>>' + excel_absolute_path)
	#解析excel文件
	data = open_excel(excel_absolute_path)

	#获取需要的工作表
	#table = data.sheets()[by_index]        
	for table in data.sheets():
		#print( 'sdfsdg' in configTup)
		#print( configTup.index('worldevent'))
		if not contain_zh(table.name) and (not table.name in configTup):
			print table.name
			#行数
			nrows = table.nrows
			#列数
			ncols = table.ncols

			#创建dom文档对象
			doc = xml.dom.minidom.Document()

			#创建根元素
			info = doc.createElement('info')

			#将根元素添加到文档中区
			doc.appendChild(info)

			for nrow in range(3, nrows):
				#创建元素
				item = doc.createElement('item')
				for ncol in range(0, ncols):
					#colnames = table.col_values(ncol)
					#print colnames 
					#            print table.cell(nrow, ncol).value
					key = u"%s" % table.cell(0, ncol).value
					field = u"%s" % table.cell(1, ncol).value#字段类型
					if key!="":
						value = table.cell(nrow, ncol).value
						#print key==""
						#print value
						#print type(value)
						if isinstance(value, float):#所有数字都视为float
						#if type(value)== float:
							#print value-int(value)>0
							#value = str(value) #'%0d' % value
							if value-int(value)==0:
								value = '%0d' % value
							else:
								value = str(value)
						#            print type(key), type(value)
						#将数据都作为xml中元素的属性，属性名就是第一行的值，属性值就是某一行某一列的值
						try:
							item.setAttribute(key.encode('utf-8'), value.encode('utf-8'))
						except AttributeError as result:
							print u"出现错误：",u"行：",nrow+1, u"列：",ncol+1
						#else

				#            print table.cell(0, ncol).value
				#将此元素作为根元素的子节点
				info.appendChild(item)

			#要生成的xml文件名
			#generate_xml_name = name.strip().split('.')[0] +'_'+table.name+ '.xml'
			generate_xml_name = table.name+ '.xml'
			#要生成的xml文件到某个目录的绝对路径
			geneate_xml_dir = os.path.join(generate_xml_dir, generate_xml_name)

			f = open(geneate_xml_dir, 'w')
			#    doc.writexml(f)
			f.write(doc.toprettyxml())          #可以使生成xml有好看的格式，要是不需要，可以使用上一行的代码
			f.close()


def translate_excel_to_json(excel_absolute_path, name, generate_json_dir):
	#print( 'translate_excel_to_xml==>>' + excel_absolute_path)
	#解析excel文件
	data = open_excel(excel_absolute_path)

	#获取需要的工作表      
	for table in data.sheets():
		if not contain_zh(table.name) and (not table.name in configTup):
			print table.name
			#行数
			nrows = table.nrows
			#列数
			ncols = table.ncols

			#保存所有数据在字典中
			adict = {}
			datas=[]

			for nrow in range(3, nrows):
				#创建元素
				# item = doc.createElement('item')
				data = {}
				for ncol in range(0, ncols):
					#colnames = table.col_values(ncol)
					#print colnames 
					#            print table.cell(nrow, ncol).value
					key = u"%s" % table.cell(0, ncol).value#转换字符串
					field = u"%s" % table.cell(1, ncol).value#字段类型
					if key!="":
						value = table.cell(nrow, ncol).value
						#将数据都作为xml中元素的属性，属性名就是第一行的值，属性值就是某一行某一列的值
						try:
							# item.setAttribute(key.encode('utf-8'), value.encode('utf-8'))
							data[key.encode('utf-8')]=transformationType(value,field) 
						except AttributeError as result:
							print u"出现错误：",u"行：",nrow+1, u"列：",ncol+1
						#else

				key= u"%s" % table.cell(nrow, 0).value
				if key!="":
					# print key
					datas.append(data)
					
			adict["data"]=datas
			#要生成的Json文件名
			generate_json_name = table.name+ '.json'
			#要生成的Json文件到某个目录的绝对路径
			geneate_json_dir = os.path.join(generate_json_dir, generate_json_name)
			data = json.dumps(adict,indent=1,ensure_ascii=False)#转字典数据换成json格式。这里需要注意需要增加ensure_ascii=False参数，否则显示字符串的时候会出现乱码。
			f = open(geneate_json_dir, 'w')
			#    doc.writexml(f)
			f.write(data)          
			f.close()

def find_assign_xlsx(xlsx_path, generate_xml_dir,generate_json_dir):

	for name in os.listdir(xlsx_path):
		if name.endswith('.xlsx') and  (not '~$' in name) :
			nameList=name.split('.')
			#newName=nameList[0]+"_temp."+nameList[1];
			newName=nameList[0]+"."+nameList[1];
			#生成excel文件的绝对路径
			excel_absolute_path = os.path.join(xlsx_path, newName)
			#解析excel并转成xml/Json
			# translate_excel_to_xml(excel_absolute_path, newName, generate_xml_dir)
			translate_excel_to_json(excel_absolute_path, newName, generate_json_dir)
			#os.unlink(newName)#y永久删除
			print name,u"===>>转换成功"


def transformationType(var,field):
    if field=="int": #type(var) == 'float':
        str1 = int(var)
    elif field=="string": #type(var) == 'unicode':
        str1 = var.encode('utf-8')
    elif field=="float" or field=="double":
    	str1 = var
    else:
        str1 = var
    return str1

def contain_zh(wd):

	word = wd.decode()
	global zh_pattern
	match = zh_pattern.search(word)
	#print "match",match==None
	return match!=None

def readTxt():
	txtPath =unicode(sys.path[0],"GB2312")+'\\ExcludeList.txt'#此文件内文件将不导出
	txtFile = open(txtPath)
	txtContent = txtFile.read()
	#print str(txtContent)
	global configTup
	configTup=txtContent.split('\n')
	num=len(configTup)
	#print str(txtContent+str(num))

if __name__ == "__main__":
    #print sys.path
    excel_src_path =unicode(sys.path[0],"GB2312")# 防止中文识别失败
    #print("===>>>"+excel_src_path)
    generate_xml_dir = unicode(sys.path[0],"GB2312")+'\\xmls'
    generate_json_dir = unicode(sys.path[0],"GB2312")+'\\jsons'
    if not os.path.exists(generate_xml_dir):
       os.makedirs(generate_xml_dir)
    if not os.path.exists(generate_json_dir):
       os.makedirs(generate_json_dir)

    readTxt();
    find_assign_xlsx(excel_src_path.decode('utf-8'), generate_xml_dir.decode('utf-8'), generate_json_dir.decode('utf-8'))
    #find_assign_xlsx(excel_src_path, generate_xml_dir)
